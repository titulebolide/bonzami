from django.db import models
import uuid

class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} - {self.id}" 

class User(models.Model):
    name = models.CharField(max_length=50)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} - {self.id}" 

class Category(models.Model):
    name = models.CharField(max_length=50)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=8) # stored as AARRGGBB

    def __str__(self):
        return f"{self.emoji} {self.name} - {self.id}"

class Expense(models.Model):
    name = models.CharField(max_length=50)
    date = models.DateTimeField()
    amount = models.FloatField()
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    by = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.name} - {self.id}" 

class ExpenseShare(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE)
    share = models.FloatField()

    def __str__(self):
        return f"{self.user.name} - {self.expense.name} - {self.share}"
