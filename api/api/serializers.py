from rest_framework import serializers
from . import models

class GroupSerializer(serializers.ModelSerializer):
    unames = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )
    uids = serializers.SerializerMethodField()

    class Meta:
        model = models.Group
        fields = ['id', 'name', 'unames', 'uids']
    
    def get_uids(self, obj):
        users = models.User.objects.filter(group=obj)
        return {user.id: user.name for user in users}

    def create(self, validated_data):
        unames = validated_data.pop('unames', [])
        group = models.Group.objects.create(**validated_data)
        for name in unames:
            models.User.objects.create(name=name, group=group)
        return group


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['id', 'name', 'group']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Category
        fields = ['id', 'name', 'group', 'emoji']


class ExpenseShareSerializer(serializers.ModelSerializer):
    uname = serializers.ReadOnlyField(source='user.name')
    uid = serializers.IntegerField(source='user.id', read_only=True)
    # Allow writing via uid field in input, or user_id
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=models.User.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = models.ExpenseShare
        fields = ['user_id', 'uid', 'uname', 'share']


class ExpenseSerializer(serializers.ModelSerializer):
    shares = ExpenseShareSerializer(source='expenseshare_set', many=True, read_only=True)
    # For writing shares, we accept a list of dicts
    shares_input = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    by_uname = serializers.ReadOnlyField(source='by.name')
    categ = CategorySerializer(source='category', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = models.Expense
        fields = ['id', 'name', 'date', 'amount', 'group', 'by', 'by_uname', 'category', 'category_id', 'categ', 'shares', 'shares_input']

    def create(self, validated_data):
        shares_data = validated_data.pop('shares_input', [])
        expense = models.Expense.objects.create(**validated_data)
        
        # Logic: if shares provided, use them. Else default equal split? 
        # Old logic: if not provided, what happens? "unseen_uids" gets all.
        # But we need access to group UIDs. 
        
        group = expense.group
        group_uids = [user.id for user in models.User.objects.filter(group=group)]
        unseen_uids = list(group_uids)

        for share_item in shares_data:
            # share_item is dict: {"uid": 123, "share": 1.0} or "123:1.0"
            # Support both if needed, but let's stick to dict for clean API
            # If the user sends "uid" key for user_id
            uid = share_item.get('uid') or share_item.get('user_id')
            share_val = share_item.get('share')
            
            if uid in unseen_uids:
                unseen_uids.remove(uid)
            
            models.ExpenseShare.objects.create(
                user_id=uid,
                expense=expense,
                share=share_val
            )
        
        # Remaining users get default share 1
        for uid in unseen_uids:
             models.ExpenseShare.objects.create(
                user_id=uid,
                expense=expense,
                share=1.0
            ) 
            
        return expense

    def update(self, validated_data):
        # We need to implement update for shares if 'shares_input' is present
        shares_data = validated_data.pop('shares_input', None)
        instance = super().update(validated_data)
        
        if shares_data is not None:
             # Logic: update existing shares for these users
             for share_item in shares_data:
                uid = share_item.get('uid') or share_item.get('user_id')
                share_val = share_item.get('share')
                
                # Try to find existing share
                try:
                    share_obj = models.ExpenseShare.objects.get(user_id=uid, expense=instance)
                    share_obj.share = share_val
                    share_obj.save()
                except models.ExpenseShare.DoesNotExist:
                    # Create if not exists? Or ignore? Old API ignored.
                    # Let's create for robustness
                    models.ExpenseShare.objects.create(user_id=uid, expense=instance, share=share_val)
        
        return instance
