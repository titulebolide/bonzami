from django.shortcuts import render
from django import http
from django.views.decorators.csrf import csrf_exempt
from . import models
import datetime as dt

@csrf_exempt
def create_group(request):
    if request.method != "GET":
        return http.HttpResponseBadRequest()
    data = request.GET
    print(data)
    if not ("unames" in data and "gname" in data):
        return http.HttpResponseBadRequest()
    group = models.Group(name = data["gname"])
    group.save()
    users = {}
    for username in data.getlist("unames"):
        user = models.User(name = username, group = group)
        user.save()
        users[username] = user.id
    return http.JsonResponse({"gid" : group.id, "uids" : users})

@csrf_exempt
def get_group(request, groupid):
    group = models.Group.objects.get(id = groupid)
    users = models.User.objects.filter(group_id = groupid)
    return http.JsonResponse({"gid" : str(groupid), "gname" : group.name, "uids" : {user.id : user.name for user in users}})


@csrf_exempt
def add_expense(request, groupid):
    if request.method != "GET":
        return http.HttpResponseBadRequest()
    data = request.GET
    if not ("name" in data and "datetime" in data and "amount" in data and "by" in data and "shares" in data):
        return http.HttpResponseBadRequest()
    group_uids = [user.id for user in models.User.objects.filter(group = groupid)]
    print(group_uids)
    if int(data["by"]) not in group_uids:
        print("by user is not in group")
        return http.HttpResponseBadRequest()
    for share_data in data.getlist("shares"):
        uid, share_num = share_data.split(":")
        if int(uid) not in group_uids:
            print(f"share user {uid} is not in group") 
            return http.HttpResponseBadRequest()
    datetime = dt.datetime.fromtimestamp(int(data["datetime"]))
    expense = models.Expense(
        name=data["name"], 
        date=datetime, 
        amount=float(data["amount"]),
        by_id = int(data["by"]),
        group_id = groupid,
    )
    expense.save()
    unseen_uids = list(group_uids)
    for share_data in data.getlist("shares"):
        uid, share_num = share_data.split(":")
        uid = int(uid)
        share_num = float(share_num)
        unseen_uids.pop(unseen_uids.index(uid))
        share = models.ExpenseShare(
            user_id = uid,
            expense = expense,
            share = share_num,
        )
        share.save()
    for uid in unseen_uids:
        default_share = 1
        share = models.ExpenseShare(
            user_id = uid,
            expense = expense,
            share = default_share,
        )
        share.save()
    return http.JsonResponse({})

def format_expense_data(expense):
    shares = models.ExpenseShare.objects.filter(expense_id=expense.id)
    return {
        "name" : expense.name,
        "date" : int(dt.datetime.timestamp(expense.date)),
        "amount" : expense.amount,
        "by_iud" : expense.by.id,
        "by_uname" : expense.by.name,
        "shares" : [
            {
                "uid" : share.user.id,
                "uname" : share.user.name,
                "share" : share.share,
            }
            for share in shares
        ]
    }


def get_expense(request, groupid, expenseid):
    expense = models.Expense.objects.get(id=expenseid)
    # check the "by" user is in the right group
    if expense.group.id != groupid:
        print(f"expense {expenseid} is not in group") 
        return http.HttpResponseBadRequest()
    return http.JsonResponse(format_expense_data(groupid, expenseid))

def get_all_expenses(request, groupid):
    expenses = models.Expense.objects.filter(group_id = groupid)
    response = []
    for expense in expenses:
        response.append(format_expense_data(expense))
    return http.JsonResponse({"data" : response})

def get_balance(request, groupid):
    users = {
        user.id : {
            "uname" : user.name,
            "total_expenses": 0,
            "total_paid": 0
        } 
        for user in models.User.objects.filter(group_id = groupid)
    }
    expenses = models.Expense.objects.filter(group_id = groupid)
    for expense in expenses:
        shares = models.ExpenseShare.objects.filter(expense_id=expense.id)
        total_share = sum(share.share for share in shares)
        for share in shares:
            users[share.user.id]["total_expenses"] += expense.amount * share.share / total_share
        users[expense.by.id]["total_paid"] += expense.amount
    for user in users:
        users[user]["total_expenses"] = round(users[user]["total_expenses"], 2)
        users[user]["balance"] = round(users[user]["total_expenses"] - users[user]["total_paid"], 2)
    return http.JsonResponse({
        "data" : users
    })
