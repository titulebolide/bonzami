import itertools
import random

balances = [25, 18, 11, -3, -6, -16, -29]
def format_bal(balances):
    return {str(i):balances[i] for i in range(len(balances))}
balances = format_bal(balances)

def simplify_with_collector(balances):
    collector = next(iter(balances.keys()))
    return [(collector, person, balance) for (person, balance)
            in balances.items() if person != collector]

def show_transactions(transactions):
    for (debtor, creditor, value) in transactions:
        if value > 0:
            print(f"{debtor} owes {creditor} ${value}")
        else:
            print(f"{creditor} owes {debtor} ${-value}")

def find_zero_subset(balances):
    for i in range(1, len(balances)):
        for subset in itertools.combinations(balances.items(), i):
            if sum([balance[1] for balance in subset]) == 0:
                return [balance[0] for balance in subset]
    return None

def get_subsets(balances):
    remaining_set = dict(balances)
    subsets = []
    while (subset := find_zero_subset(remaining_set)) is not None:
        subsets.append(subset)
        remaining_set = {x[0]: x[1] for x in remaining_set.items() if x[0] not in subset}
    subsets.append(list(remaining_set.keys()))
    return subsets

def get_optimal_transactions(balances):
    subsets = get_subsets(balances)
    optimal_transactions = []
    for subset in subsets:
        subset_balances = {person: balances[person] for person in subset}
        optimal_transactions.extend(simplify_with_collector(subset_balances))
    return optimal_transactions

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
    print("total", len(len_bals) * len(n_transacs) * n_tests)
    for ln in len_bals:
        print(ln)
        for ntr in n_transacs:
            for nte in range(n_tests):
                try:
                    bals = gen_bal(ln, ntr)
                    bals = format_bal(bals)
                    res = len(get_optimal_transactions(bals))
                    assert res <= ntr
                except AssertionError:
                    print(f"Failed assersion for {bals} in max {ntr}")
                    return
                
print(test_transacs())