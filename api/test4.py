# Python3 program to find maximum
# cash flow among a set of persons

import numpy as np

# Number of persons(or vertices in graph)
N = 6

# A utility function that returns
# index of minimum value in arr[]
def getMin(arr):
	
	minInd = 0
	for i in range(1, N):
		if (arr[i] < arr[minInd]):
			minInd = i
	return minInd

# A utility function that returns
# index of maximum value in arr[]
def getMax(arr):

	maxInd = 0
	for i in range(1, N):
		if (arr[i] > arr[maxInd]):
			maxInd = i
	return maxInd

# A utility function to
# return minimum of 2 values
def minOf2(x, y):

	return x if x < y else y

# amount[p] indicates the net amount to
# be credited/debited to/from person 'p'
# If amount[p] is positive, then i'th 
# person will amount[i]
# If amount[p] is negative, then i'th
# person will give -amount[i]
def minCashFlowRec(amount):

	# Find the indexes of minimum
	# and maximum values in amount[]
	# amount[mxCredit] indicates the maximum
	# amount to be given(or credited) to any person.
	# And amount[mxDebit] indicates the maximum amount
	# to be taken (or debited) from any person.
	# So if there is a positive value in amount[], 
	# then there must be a negative value
	mxCredit = getMax(amount)
	mxDebit = getMin(amount)

	# If both amounts are 0, 
	# then all amounts are settled
	if (amount[mxCredit] == 0 and amount[mxDebit] == 0):
		return 0

	# Find the minimum of two amounts
	min = minOf2(-amount[mxDebit], amount[mxCredit])
	amount[mxCredit] -=min
	amount[mxDebit] += min

	# If minimum is the maximum amount to be
	print("Person " , mxDebit , " pays " , min
		, " to " , "Person " , mxCredit)

	# Recur for the amount array. Note that
	# it is guaranteed that the recursion
	# would terminate as either amount[mxCredit] 
	# or amount[mxDebit] becomes 0
	minCashFlowRec(amount)

# Given a set of persons as graph[] where
# graph[i][j] indicates the amount that
# person i needs to pay person j, this
# function finds and prints the minimum 
# cash flow to settle all debts.
def minCashFlow(graph):

	# Create an array amount[],
	# initialize all value in it as 0.
	amount = [0 for i in range(N)]

	# Calculate the net amount to be paid
	# to person 'p', and stores it in amount[p].
	# The value of amount[p] can be calculated by
	# subtracting debts of 'p' from credits of 'p'
	for p in range(N):
		for i in range(N):
			amount[p] += (graph[i][p] - graph[p][i])
	print(amount)

	minCashFlowRec(amount)

def balance_to_graph(bal):
	graph = np.eye(len(bal))
	pos = {}
	neg = {}
	for i, a in enumerate(bal):
		if a > 0:
			pos[i] = a
		elif a < 0:
			neg[i] = -a
	for i, ai in neg.items():
		remaining_ai = ai
		for j, aj in pos.items():
			available = min(aj, remaining_ai)
			pos[j] -= available
			remaining_ai -= available
			graph[i,j] = available
			if remaining_ai == 0:
				break
	return graph.tolist()

def graph_to_balance(graph):
	graph = np.array(graph)
	balances = [0]*len(graph)
	for i in range(graph.shape[0]):
		for j in range(graph.shape[1]):
			balances[i] -= graph[i,j]
			balances[j] += graph[i,j]
	return balances

b1 = [2, 4, -1, -3, -2] # in 3
b2 =  [2, 2, 4, -1, -5, -2] # in 4
b3 = [15,7,6 -10, -5,-13] # in 4
b4 = [26, -26, 0]
b5 = [28, 23, 20, -43, -28] # in 3
b6 = [-14, 21, -23, 2, 27, -13] # in 4
b7 = [-16, 18, -9, 25, -29, 11] # in 4
b8 = [25, 18, 11, -3, -6, -16, -29] # in 5, need 3 elt sums ?
# 3->0 3
# 4->0 6
# 5->0 16
# 6->1 18
# 6->2 11
balances = b7
graph = balance_to_graph(balances)
print(balances)
print(graph)
print(graph_to_balance(graph))

minCashFlow(balance_to_graph(balances))
