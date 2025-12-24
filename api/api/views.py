from rest_framework import viewsets, status, decorators, response
from rest_framework import filters as drf_filters
from django_filters import rest_framework as filters
from django.shortcuts import get_object_or_404
from . import models, serializers
import datetime as dt

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


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = models.Category.objects.all()
    serializer_class = serializers.CategorySerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('group',)


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = models.Expense.objects.all()
    serializer_class = serializers.ExpenseSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('group',)

    # Creation and Update logic is now in Serializer.
    # No custom create() or update() needed here!
    
    @decorators.action(detail=True, methods=['get'])
    def info(self, request, pk=None):
        return self.retrieve(request)
