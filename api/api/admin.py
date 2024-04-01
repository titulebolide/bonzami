from django.contrib import admin

from . import models

admin.site.register(models.User)
admin.site.register(models.Group)
admin.site.register(models.Expense)
admin.site.register(models.ExpenseShare)
