from rest_framework import viewsets, status, decorators, response, pagination
from rest_framework import filters as drf_filters
from django_filters import rest_framework as filters
from django.shortcuts import get_object_or_404
from . import models, serializers
import datetime as dt
from django.db.models import Sum, F
from django.db.models.functions import TruncDate
from transformers import pipeline

classifier = None

def get_classifier():
    global classifier
    if classifier is None:
        classifier = pipeline("zero-shot-classification", model="cmarkea/distilcamembert-base-nli", tokenizer="cmarkea/distilcamembert-base-nli")
        # classifier = pipeline("zero-shot-classification", model="MoritzLaurer/mDeBERTa-v3-base-mnli-xnli")
    return classifier

class GroupViewSet(viewsets.ModelViewSet):
    queryset = models.Group.objects.all()
    serializer_class = serializers.GroupSerializer

    @decorators.action(detail=True, methods=['get'])
    def info(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        # We can just return standard serializer data now, but for legacy compat we might want to keep the odd structure or just return direct data
        # "info" typically just means retrieve. 
        # Let's return standard data. The standardized API should be standard.
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=['get'])
    def balance(self, request, pk=None):
        # Calculation logic remains in view as it's not resource manipulation but computation
        # ... logic ...
        users = {
            user.id : {
                "uname" : user.name,
                "total_expenses": 0,
                "total_paid": 0
            } 
            for user in models.User.objects.filter(group_id=pk)
        }
        expenses = models.Expense.objects.filter(group_id=pk)
        for expense in expenses:
            shares = models.ExpenseShare.objects.filter(expense_id=expense.id)
            total_share = sum(share.share for share in shares)
            if total_share == 0: continue
            for share in shares:
                users[share.user.id]["total_expenses"] += expense.amount * share.share / total_share
            users[expense.by.id]["total_paid"] += expense.amount
            
        for user in users:
            users[user]["total_expenses"] = round(users[user]["total_expenses"], 2)
            users[user]["balance"] = round(users[user]["total_expenses"] - users[user]["total_paid"], 2)
            
        return response.Response({"data": users})

    @decorators.action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        group_id = pk
        category_filter = request.query_params.get('category')

        expenses = models.Expense.objects.filter(group_id=group_id).order_by('date')
        
        # 1. Total Expense (Global for the group, or filtered? UI suggests global context usually, but timeline is filtered)
        # However, if we filter everything by category in the backend, the "Total" card will change when category is selected. 
        # In the original UI:
        # - "Total Expenses" card depended on `expenses` array which WAS filtered? 
        # No, the original `statsLoader` fetched ALL expenses. 
        # And `totalExpense` was derived from ALL expenses. 
        # The Filter `selectedCategory` ONLY affected `timelineData`.
        # `categoryData` (Pie) also used ALL expenses.
        # So: Backend should return Global Total and Global Category Breakdown.
        # Timeline should be filtered if requested, or return all.
        
        total_expense = expenses.aggregate(total=Sum('amount'))['total'] or 0

        # 2. Category Breakdown (Global)
        category_stats = expenses.values(
            cat_name=F('category__name'), 
            cid=F('category__id')
        ).annotate(value=Sum('amount')).order_by('-value')
        
        # Add "Other" for null categories
        # Django makes this a bit tricky with values(). 
        # We can handle None in python or use Coalesce if we really want, but Python is fine for small scale.
        formatted_categories = []
        for cat in category_stats:
            name = cat['cat_name'] if cat['cat_name'] else "Other"
            formatted_categories.append({
                "name": name,
                "value": cat['value'],
                "id": cat['cid']
            })

        # 3. Timeline (Filtered if requested)
        timeline_expenses = expenses
        if category_filter and category_filter != 'all':
             if category_filter == "Other":
                 timeline_expenses = timeline_expenses.filter(category__isnull=True)
             else:
                 timeline_expenses = timeline_expenses.filter(category__name=category_filter)
        
        # We need daily accumulation.
        # Original: "Sort ALL expenses by date... Accumulate... Always push a data point"
        # We can use DB aggregation by Date.
        daily_stats = timeline_expenses.annotate(
            day=TruncDate('date')
        ).values('day').annotate(
            daily_sum=Sum('amount')
        ).order_by('day')

        # Accumulate in Python
        timeline_data = []
        acc = 0
        for entry in daily_stats:
             acc += entry['daily_sum']
             timeline_data.append({
                 "date": entry['day'].strftime("%d/%m/%Y"), # Simplified date format matching locale roughly, or use ISO
                 "fullDate": entry['day'].isoformat(),
                 "amount": acc,
                 "daily_sum": entry['daily_sum'] # Extra info might be useful
             })
             
        return response.Response({
            "total_expense": total_expense,
            "category_breakdown": formatted_categories,
            "timeline": timeline_data
        })

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = models.Category.objects.all()
    serializer_class = serializers.CategorySerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('group',)

    filterset_fields = ('group',)


class AppPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = models.Expense.objects.all().order_by('-date', '-id')
    serializer_class = serializers.ExpenseSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('group',)
    pagination_class = AppPagination

    # Creation and Update logic is now in Serializer.
    # No custom create() or update() needed here!
    
    @decorators.action(detail=True, methods=['get'])
    def info(self, request, pk=None):
        return self.retrieve(request)


class PredictCategoryView(viewsets.ViewSet):
    def create(self, request):
        title = request.data.get('title')
        group_id = request.data.get('group')
        
        if not title or not group_id:
            return response.Response(
                {"error": "Both 'title' and 'group' are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        categories = models.Category.objects.filter(group_id=group_id)
        if not categories.exists():
             return response.Response(
                {"error": "No categories found for this group."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        candidate_labels = [c.name for c in categories]
        
        try:
            clf = get_classifier()
            output = clf(title, candidate_labels, hypothesis_template="Cette description parle de {}.", multi_label=False)
            
            # Create a lookup for categories by name
            category_map = {c.name: c for c in categories}
            
            # Zip labels and scores, take top 4
            results = []
            predictions = list(zip(output['labels'], output['scores']))
            
            # Sort just in case, though usually returned sorted
            predictions.sort(key=lambda x: x[1], reverse=True)
            
            for label, score in predictions[:4]:
                cat = category_map.get(label)
                if cat:
                    results.append({
                        "id": cat.id,
                        "score": score
                    })
            
            return response.Response(results)
            
        except Exception as e:
            return response.Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
