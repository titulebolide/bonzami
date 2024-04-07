import { useLoaderData, useParams } from "react-router-dom";
import "./Expense.css"

export async function expenseLoader({params}) {
  const res = await fetch("http://127.0.0.1:8000/api/g/" + params.guid + "/e/" + params.expenseid + "/info")
  let dat = res.json()
  dat.guid = params.guid
  dat.expenseid = params.expenseid
  return dat
}

function ToolHeader({leftIcon, leftIconOnClick, rightIcon, rightIconOnClick}) {
  return (
    <div id="tool-hdr">
      <div className="tool-hdr-btn" onClick={leftIconOnClick}>
        <i className={leftIcon}></i>
      </div>
      <div className="tool-hdr-btn" onClick={rightIconOnClick}>
        <i className={rightIcon}></i>
      </div>
    </div>  
  )
}

export default function Expense() {
  const expense = useLoaderData();
  let params = useParams();
  console.log(params)
  return (
    <>
      <ToolHeader
        leftIcon = "ri-arrow-left-line"
        leftIconOnClick = {() => {window.location = `/g/${params.guid}`}}
        rightIcon = "ri-pencil-fill"
        rightIconOnClick = {() => {window.location = `/g/${params.guid}/e/${params.expenseid}/edit`}}
      />
      <div className="box">
        <div className="columns">
          <div className="column">
            <div className="title">{expense.name}</div>
            <div className="subtitle">paid by {expense.by_uname}</div>
          </div>
          <div className="column is-narrow">
            <div className="title">{expense.amount} €</div>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="title is-5">Shares</div>
        <div className="columns is-mobile">
          <div className="column is-offset-1">
            {
              expense.shares.map((share, index) => (
                <div className="columns is-mobile" key={index}>
                  <div className="column" style={{textAlign: "right"}}>{share.uname}</div>
                  <div className="column">{share.share}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}