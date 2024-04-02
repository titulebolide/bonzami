import { useLoaderData } from "react-router-dom";


export async function expenseLoader({params}) {
  console.log(params)
  const res = await fetch("http://127.0.0.1:8000/api/g/" + params.guid + "/e/" + params.expenseid + "/info")
  return res.json()
}

export default function Expense() {
  const expense = useLoaderData();
  console.log(expense)
  return (
    <>
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
        <div className="columns">
          <div className="column is-offset-1">
            {
              expense.shares.map((share, index) => (
                <div className="columns" key={index}>
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