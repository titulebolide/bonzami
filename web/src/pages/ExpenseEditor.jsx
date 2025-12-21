import { useLoaderData } from "react-router-dom";
import "./ExpenseEditor.css"

export async function expenseEditorLoader({params}) {
  const groupData = await fetch("http://127.0.0.1:8000/api/g/" + params.guid + "/info")
  return await groupData.json()
}

export default function ExpenseEditor() {
  const groupData = useLoaderData();

  console.log(groupData.uids)
  
  return (
    <div id="expense-editor-container">
      <div className="field">
        <label className="label">Name</label>
        <div className="control">
          <input className="input" type="text" placeholder="Expense name"/>
        </div>
      </div>

      <div className="field">
        <label className="label">Payer</label>
        <div className="control">
          <div className="select">
            <select>
              {
                Object.entries(groupData.uids).map(([uid, name],i) => (
                  <option key={uid}>{name}</option>
                ))
              }
            </select>
          </div>
        </div>
      </div>

      <div className="field">
        <label className="label">Amount</label>
        <div className="columns is-mobile">
          <div className="control column">
            <input className="input" type="number" placeholder="54"/>
          </div>
          <div className="column is-2 vertical-center is-5">€</div>
        </div>
      </div>

      <div className="field">
        <label className="label">Shares</label>
        <div id="expense-editor-share-container">
          {
            Object.entries(groupData.uids).map(([uid, name],i) => (
              <div key={uid}>
                {i!==0 && <div className="expense-editor-share-ruler"></div>}
                <div className="columns is-mobile expense-editor-share-entry">
                  <div className="column capitalize vertical-center">
                    {name}
                  </div>
                  <div className="field column">
                    <div className="control">
                      <input className="input" type="number" value="1"/>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
