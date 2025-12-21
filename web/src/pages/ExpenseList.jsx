import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";

import EditButtons from "../components/EditButtons";

let groupid = "accfad71-8456-4ac2-8880-e609e85a52a5"

export async function expenseListLoader({ params }) {
  const [expensesRes, groupRes] = await Promise.all([
    fetch("http://127.0.0.1:8000/api/g/" + params.guid + "/allexpenses"),
    fetch("http://127.0.0.1:8000/api/g/" + params.guid + "/info"),
  ])
  let groupData = await groupRes.json()
  let expensesData = await expensesRes.json()
  return [groupData, expensesData.data]
}

function timestampToDate(timestamp) {
  var date = new Date(timestamp * 1000); // Convert seconds to milliseconds

  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-11 in JavaScript
  var year = date.getFullYear();

  return day + "/" + month + "/" + year;
}

function ExpenseItem({ expense, isCollapsed, onClick }) {
  return (
    <div onClick={onClick} className="bg-white rounded-lg shadow-md p-4 cursor-pointer">
      <div className="flex items-center">
        <div className="flex-none grid place-items-center w-10 text-[20px] text-center">
          {expense.categ.emoji}
        </div>
        <div className="flex-1 px-3">
          <div><strong>{expense.name}</strong></div>
          <div><span className="text-gray-400">paid by </span>{expense.by.name}</div>
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
              {expense.categ.name}
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
            <EditButtons
              onClick={() => { }}
            />
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

  const [collapsedIndex, setCollapsedIndex] = useState(null)

  let prevDate = null

  return (
    <>
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="p-4 text-4xl font-bold">{group.gname}</div>
      </div>
      <div id="expense-list">
        {
          expenses.map((expense) => {
            let currDate = timestampToDate(expense.date)
            let showDate = (currDate !== prevDate)
            prevDate = currDate
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
                />
              </div>
            )
          })
        }
      </div>
    </>
  )
}
