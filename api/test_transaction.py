import time
from collections import defaultdict
import random

def minimize_transactions(balances):
    assert sum(balances) == 0
    # Create a dictionary to store the balances and the indices of the people
    balances_dict = defaultdict(list)
    for i, b in enumerate(balances):
        balances_dict[b].append(i)

    # Initialize an empty list to store the transactions
    transactions = []

    # Start from the smallest negative balance and pair it up with the smallest positive balance
    j = 0
    balance = sorted(balances_dict.keys())[j]
    while balance < 0:
        # balance is negative from here

        # print("curr balance", balance)
        # print(" ", dict(balances_dict))

        # If the balance is negative, pair it up with the smallest positive balance
        while balances_dict[balance]:
            # print(balances_dict[balance])
            # Get the index of the person with the current balance
            left_index = balances_dict[balance].pop()
            # print("  curlefti", left_index)

            # Find the smallest positive balance that is greater than or equal to the absolute value of the current balance
            rbf = 0
            for right_balance in sorted(balances_dict.keys())[1:]:
                if len(balances_dict[right_balance]) == 0:
                    continue
                # print("    rb", right_balance)
                rbf = right_balance
                if right_balance >= -balance:
                    break
            right_balance = rbf
            # print("    rbf", right_balance)

            # Get the index of the person with the smallest positive balance
            right_index = balances_dict[right_balance].pop()
            # if balances_dict[right_balance] == []:
            #     del balances_dict[right_balance]

            # Add the transaction to the list of transactions
            transactions.append((left_index, right_index, -balance))

            # Update the balance of the person with the positive balance
            new_balance = right_balance + balance
            if new_balance == 0:
                continue
            balances_dict[new_balance].append(right_index)

        j += 1
        balance = sorted(balances_dict.keys())[j]

    return transactions


def count_minimial_transactions(balances):
    bal_pos = [i for i in balances if i > 0]
    bal_neg = [-i for i in balances if i < 0]

    assert sum(bal_pos) == sum(bal_neg)

    n_transac = 0

    while len(bal_pos) != 0:
        # check for  matching elts
        for i in range(len(bal_pos)):
            if bal_pos[i] in bal_neg:
                bal_neg.pop(bal_neg.index(bal_pos[i]))
                bal_pos.pop(i)
                n_transac += 1
                break


        # compute two elements sums for bal_pos
        for i in range(len(bal_pos)):
            for j in range(i+1, len(bal_pos)):
                # j>i
                if i == j: continue
                som = bal_pos[i] + bal_pos[j]
                if som in bal_neg:
                    bal_neg.pop(bal_neg.index(som))
                    bal_pos.pop(j) # pop j first to prevent shifting i
                    bal_pos.pop(i)
                    n_transac += 2
                    break

        # compute two elements sums for bal_neg
        for i in range(len(bal_neg)):
            for j in range(i+1, len(bal_neg)):
                # j>i
                if i == j: continue
                som = bal_neg[i] + bal_neg[j]
                if som in bal_pos:
                    bal_pos.pop(bal_pos.index(som))
                    bal_neg.pop(j) # pop j first to prevent shifting i
                    bal_neg.pop(i)
                    n_transac += 2
                    break

    return n_transac
        



def check_transaction(b, ts):
    cur_bal = list(b)
    # print(cur_bal)
    for emitter, receiver, amount in ts:
        cur_bal[emitter] += amount
        cur_bal[receiver] -= amount
        # print(cur_bal)
    for i in cur_bal:
        if i != 0:
            return False
    return True

def gen_bal(leng, n_transac=0, transac_size = 30):
    if n_transac == 0:
        n_transac = 5*leng
    bal = [0]*leng
    for i in range(n_transac):
        emitter = int(random.random()*leng)
        receiver = int(random.random()*leng)
        amount = int(random.random()*transac_size)
        bal[emitter] -= amount
        bal[receiver] += amount
    assert sum(bal) == 0
    return bal

def reverse_bal(bal):
    return [-i for i in bal]

def shuffle_bal(bal):
    bis = list(bal)
    random.shuffle(bis)
    return bis

def test_transacs():
    len_bals = list(range(2, 30))
    n_transacs = list(range(1, 60))
    n_tests = 100
    nshuffles = 2
    print("total", len(len_bals) * len(n_transacs) * n_tests * (nshuffles+1) * 2)
    for ln in len_bals:
        print(ln)
        for ntr in n_transacs:
            for nte in range(n_tests):
                try:
                    bals = gen_bal(ln, ntr)
                    res = len(minimize_transactions(bals))
                    nres = len(minimize_transactions(reverse_bal(bals)))
                    assert res <= ntr or nres <= ntr
                    # for _ in range(nshuffles):
                    #     random.shuffle(bals)
                    #     nres = len(minimize_transactions(bals))
                    #     assert nres == res
                    #     nres = len(minimize_transactions(reverse_bal(bals)))
                    #     assert nres == res
                except AssertionError:
                    print(f"Failed assersion for {bals} in max {ntr}")
                    return

def print_transaction(transactions):
    for transaction in transactions:
        print(f"Person {transaction[0]} pays {transaction[2]} to person {transaction[1]}")

if 0:
    test_transacs()

else:
    b1 = [2, 4, -1, -3, -2] # in 3
    b2 =  [2, 2, 4, -1, -5, -2] # in 4
    b3 = [15,7,6 -10, -5,-13] # in 4
    b4 = [26, -26, 0]
    b5 = [28, 23, 20, -43, -28] # in 3
    b6 = [-14, 21, -23, 2, 27, -13] # in 4
    b7 = [-16, 18, -9, 25, -29, 11] # in 4
    b8 = [25, 18, 11, -3, -6, -16, -29] # in 5, need 3 elt sums ?
    balances = b8
    print(count_minimial_transactions(balances))
    # transactions = minimize_transactions(balances)
    # print("transaction length", len(transactions))
    # if (check_transaction(balances, transactions)):
    #     print("valid transactions")
    # else:
    #     print("INVALID transactions")
    # print(balances)
    # print(transactions)
