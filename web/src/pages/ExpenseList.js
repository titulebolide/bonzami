import {useEffect, useState} from "react";
import { useLoaderData } from "react-router-dom";

let groupid = "accfad71-8456-4ac2-8880-e609e85a52a5"

export async function expenseListLoader({params}) {
  const res = await fetch("http://127.0.0.1:8000/api/g/" + params.guid + "/allexpenses")
  return res.json()
}

function timestampToDate(timestamp) {
  var date = new Date(timestamp * 1000); // Convert seconds to milliseconds

  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-11 in JavaScript
  var year = date.getFullYear();

  return day + "/" + month + "/" + year;
}

function ExpenseItem({expense}) {
  return (
    <div className="box" onClick={()=>window.location += "/e/" + expense.id}>
      <div className="columns">
        <div className="column">
          <strong>{expense.name}</strong>
        </div>
        <div className="column is-one-fifth" style={{textAlign:"right"}}>
          <strong>{expense.amount}</strong> €
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <span className="has-text-grey-light">paid by </span>{expense.by_uname}
        </div>
        <div className="column is-one-fifth" style={{textAlign:"right"}}>
          {timestampToDate(expense.date)}
        </div>
      </div>
    </div>
  )
}

export default function ExpenseList() {
  const expenses = useLoaderData().data;

  return expenses.map((expense) =>
    <div className="block" key={expense.id}>
      <ExpenseItem
        expense={expense}
      />
    </div>
  )
}
