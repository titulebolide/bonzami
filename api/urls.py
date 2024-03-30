from django.urls import path

from . import views

urlpatterns = [
    path("addgroup", views.create_group),
    path("g/<uuid:groupid>/info", views.get_group),
    path("g/<uuid:groupid>/addexpense", views.add_expense),
    path("g/<uuid:groupid>/allexpense", views.get_all_expenses),
    path("g/<uuid:groupid>/e/<int:expenseid>/info", views.get_expense),
    path("g/<uuid:groupid>/balance", views.get_balance),
]
