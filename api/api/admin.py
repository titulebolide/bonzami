from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.http import urlencode

from . import models

class UserInline(admin.TabularInline):
    model = models.User
    extra = 0

class CategoryInline(admin.TabularInline):
    model = models.Category
    extra = 0

class GroupAdmin(admin.ModelAdmin):
    inlines = [UserInline, CategoryInline]
    readonly_fields = ["view_all_expenses"]

    def view_all_expenses(self, obj):
        count = obj.expense_set.count()
        url = (
            reverse("admin:api_expense_changelist")
            + "?"
            + urlencode({"group__id": f"{obj.id}"})
        )
        return format_html(
            '<a href="{}">View all {} expenses (showing latest 50 inlines)</a>',
            url,
            count,
        )

    view_all_expenses.short_description = "Expenses"

admin.site.register(models.User)
admin.site.register(models.Group, GroupAdmin)
admin.site.register(models.Expense)
admin.site.register(models.ExpenseShare)
admin.site.register(models.Category)
