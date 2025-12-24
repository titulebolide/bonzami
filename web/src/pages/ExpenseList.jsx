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

function ExpenseItem({ expense, isCollapsed, onClick, onEdit }) {
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
            <div
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(expense.id);
              }}
            >
              <i className="ri-pencil-fill text-gray-600 text-lg"></i>
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
          </div>

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
    </>
  )
}
