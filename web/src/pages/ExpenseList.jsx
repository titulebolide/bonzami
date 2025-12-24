import { useEffect, useState, useLayoutEffect } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";



// Remove old static assignment
// let groupid = "accfad71-8456-4ac2-8880-e609e85a52a5"

export async function expenseListLoader({ params }) {
  const [expensesRes, groupRes] = await Promise.all([
    fetch("http://127.0.0.1:8000/api/expenses/?group=" + params.guid),
    fetch("http://127.0.0.1:8000/api/groups/" + params.guid + "/"),
  ])
  let groupData = await groupRes.json()
  let expensesData = await expensesRes.json()
  // expensesData is now the list directly
  return [groupData, expensesData]
}

function timestampToDate(dateString) {
  var date = new Date(dateString); // Handle ISO string

  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-11 in JavaScript
  var year = date.getFullYear();

  return day + "/" + month + "/" + year;
}

function ExpenseItem({ expense, isCollapsed, onClick, onEdit, onDelete }) {
  const categ = expense.categ || { emoji: "🍆", name: "other" }

  return (
    <div onClick={(e) => {
      // Prevent collapsing if we click buttons? EditButtons handles stopPropagation internally but checks target.
      onClick()
    }}
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer">
      <div className="flex items-center">
        <div className="flex-none grid place-items-center w-10 text-[20px] text-center">
          {categ.emoji}
        </div>
        <div className="flex-1 px-3">
          <div><strong>{expense.name}</strong></div>
          <div><span className="text-gray-400">paid by </span>{expense.by_uname}</div>
        </div>
        <div className="flex-none grid place-items-center text-right text-[20px]">
          <span>
            <strong>{expense.amount.toFixed(2)}</strong> €
          </span>
        </div>
      </div>
      <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isCollapsed ? "max-h-[500px]" : "max-h-0"}`}>
        <div className="flex mt-4">
          <div className="flex-none w-10 text-[20px] text-center">
            <div className="mx-auto text-[17px] tracking-[3px] uppercase [writing-mode:vertical-rl] rotate-180">
              {categ.name}
            </div>
          </div>
          <div className="w-1/3 px-3">

            <p className="text-xl font-bold mb-2">Shares</p>
            {expense.shares.map((share, index) => (
              <div key={index} className="flex mb-2">
                <div className="flex-1">
                  <strong>{share.uname}</strong>
                </div>
                <div className="flex-none text-right">
                  {share.share}
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1"></div>
          <div className="flex-none">
          </div>
        </div>
        <div className="flex px-3 pb-3 gap-2">
          <div className="flex-1"></div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(expense);
            }}
          >
            <i className="ri-delete-bin-line"></i>
            <span className="font-semibold text-sm">Delete</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(expense.id);
            }}
          >
            <i className="ri-pencil-fill"></i>
            <span className="font-semibold text-sm">Edit</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function DateHeader({ date }) {
  return (
    <div className="flex items-center py-4">
      <div className="flex-1 border-b border-gray-300 ml-10 mr-4"></div>
      <div className="font-bold text-gray-600">{date}</div>
      <div className="flex-1 border-b border-gray-300 ml-4 mr-10"></div>
    </div>
  )
}

export default function ExpenseList() {
  const [group, expenses] = useLoaderData()
  const navigate = useNavigate();
  const params = useParams();

  const [collapsedIndex, setCollapsedIndex] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState(null)

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense)
    setDeleteModalOpen(true)
  }

  const performDelete = async () => {
    if (!expenseToDelete) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/expenses/${expenseToDelete.id}/`, {
        method: "DELETE"
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setExpenseToDelete(null);
        navigate(0); // Reload data
      } else {
        alert("Failed to delete expense");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete expense");
    }
  }



  useLayoutEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, [expenses])

  return (
    <>

      <div id="expense-list" className="flex flex-col-reverse">
        {
          [...expenses].reverse().map((expense, index, array) => {
            let currDate = timestampToDate(expense.date)
            let nextExpense = array[index + 1]
            let nextDate = nextExpense ? timestampToDate(nextExpense.date) : null
            let showDate = (currDate !== nextDate)

            return (
              <div key={expense.id} className="pb-4">
                {showDate && <DateHeader date={currDate} />}
                <ExpenseItem
                  expense={expense}
                  isCollapsed={collapsedIndex === expense.id}
                  onClick={() => {
                    setCollapsedIndex(
                      collapsedIndex === expense.id ? null : expense.id
                    )
                  }}
                  onEdit={(eid) => {
                    navigate(`/g/${params.guid}/e/${eid}/edit`)
                  }}
                  onDelete={handleDeleteClick}
                />
              </div>
            )
          })
        }
      </div>

      {/* Floating Action Button for New Expense */}
      <button
        onClick={() => navigate(`/g/${params.guid}/new`)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 z-40"
      >
        <i className="ri-add-line text-3xl"></i>
      </button>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-delete-bin-line text-3xl"></i>
              </div>
              <h3 className="font-bold text-xl text-gray-800">Delete Expense?</h3>
              <p className="text-gray-500">
                Are you sure you want to delete <span className="font-bold text-gray-700">"{expenseToDelete?.name}"</span>?
                <br /><span className="text-sm">This action cannot be undone.</span>
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex gap-2 rounded-b-2xl">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={performDelete}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
