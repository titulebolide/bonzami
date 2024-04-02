import {useEffect, useState} from "react";
import { useLoaderData } from "react-router-dom";

let groupid = "accfad71-8456-4ac2-8880-e609e85a52a5"

export async function expenseListLoader({params}) {
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

function ExpenseItem({groupid, expense}) {
  return (
    <div 
      className="box expense-item" 
      onClick={()=> window.location = `/g/${groupid}/e/${expense.id}`}
    >
      <div className="columns is-mobile">
        <div className="column">
          <div><strong>{expense.name}</strong></div>
          <div><span className="has-text-grey-light">paid by </span>{expense.by_uname}</div>
        </div>
        <div className="column is-narrow" style={{textAlign:"right"}}>
          <div>
            <strong>{expense.amount}</strong> €
          </div>
          <div>
            {timestampToDate(expense.date)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExpenseList() {
  const [group, expenses] = useLoaderData();

  return (
    <>
      <div className="title is-2">{group.gname}</div>
      {
        expenses.map((expense) =>
          <div className="block" key={expense.id}>
            <ExpenseItem
              groupid={group.gid}
              expense={expense}
            />
          </div>
        )
      }
    </>
  )
}
