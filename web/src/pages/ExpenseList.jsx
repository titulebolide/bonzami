import {useEffect, useState} from "react";
import { useLoaderData } from "react-router-dom";

import EditButtons from "../components/EditButtons";

import "./ExpenseList.css"

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

function ExpenseItem({ expense, isCollapsed, onClick }) {
  return (
    <div onClick={onClick} className="box">
      <div className="columns" style={{marginBottom:"calc(var(--bulma-column-gap)*-1"}}>
        <div className="column is-narrow place-element-center">
          <div style={{"fontSize": 20, "width":40, "textAlign": "center"}}>
           {expense.categ.emoji}
          </div>
        </div>
        <div className="column">
          <div><strong>{expense.name}</strong></div>
          <div><span className="has-text-grey-light">paid by </span>{expense.by.name}</div>
        </div>
        <div className="column is-narrow place-element-center" style={{ textAlign: "right", "fontSize": "20px" }}>
          <span>
            <strong>{expense.amount.toFixed(2)}</strong> €
          </span>
        </div>
      </div>
      <div className={"expense-item " + (isCollapsed ? "expense-item-collapsed" : "")}>
        <div className="columns" style={{marginTop: "1em"}}>
          <div className="column is-narrow">
            <div style={{"fontSize": 20, "width":40, "textAlign": "center"}}>
              <div className="horizontal-center category-name">
              {expense.categ.name}
              </div>
            </div>
          </div>
          <div className="column is-one-third">
            
            <p className="title is-5">Shares</p>
            {expense.shares.map((share, index) => (
              <div key={index} className="columns is-mobile" style={{ marginBottom: "0.5em" }}>
                <div className="column">
                  <strong>{share.uname}</strong>
                </div>
                <div className="column is-narrow has-text-right">
                  {share.share}
                </div>
              </div>
            ))}
          </div>
          <div className="column"></div>
          <div className="column is-narrow">
            <EditButtons
              onClick={() => {}}
            />
          </div>
        </div>
        <div className="columns">
          <div className="column">
          </div>
          
        </div>
      </div>
    </div>
  )
}

function DateHeader({date}) {
  return (
    <>
      <div className="columns" style={{paddingTop: "1em"}} >
        <div className="column is-1"></div>
        <div className="column vertical-center">
          <div className="horizontal-ruler"></div>
        </div>
        <div className="column is-narrow">
          <div>
            <h2 className="has-text-weight-bold">{date}</h2>
          </div>
        </div>
        <div className="column vertical-center">
         <div className="horizontal-ruler"></div>
        </div>
        <div className="column is-1"></div>
      </div>
    </>
  )
}

export default function ExpenseList() {
  const [group, expenses] = useLoaderData()

  const [collapsedIndex, setCollapsedIndex] = useState(null)

  let prevDate = null

  // scroll all the way down to the bottom of the page
  // TODO : Do that only at opening
  // useEffect(() => {
  //   window.scrollTo(0, document.body.scrollHeight)
  // })

  return (
    <>
      <div className="card" style={{position: "sticky", top: 0, zIndex: 100}}>
        <div className="card-content title is-2">{group.gname}</div>
      </div>
      <div id="expense-list">
        {
          expenses.map((expense) => {
            let currDate = timestampToDate(expense.date)
            let showDate = (currDate !== prevDate)
            prevDate = currDate
            return (
              <div key={expense.id} style={{paddingBottom: "1em"}}>
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
