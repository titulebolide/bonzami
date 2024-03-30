from django.db import models
import uuid

class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)

class User(models.Model):
    name = models.CharField(max_length=50)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

class Expense(models.Model):
    name = models.CharField(max_length=50)
    date = models.DateTimeField()
    amount = models.FloatField()
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    by = models.ForeignKey(User, on_delete=models.CASCADE)

class ExpenseShare(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE)
    share = models.FloatField()
