import random
import itertools

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

def iSS(set, som, n = None):
    if n is None:
        n = len(set)
    if n == 1:
        return set[0] == som
    else:
        return set[n-1] == som or iSS(set, som, n-1) or iSS(set, som - set[n-1], n-1)


def test_iss(n):
    bal = [int(random.random()*30) for _ in range(n)]
    for i in range(1,n):
        for sub in itertools.combinations(bal, i):
            if not iSS(bal, sum(sub)):
                print(f"error for {bal}, {sum(sub)}, {sub}")
                return False
    return True