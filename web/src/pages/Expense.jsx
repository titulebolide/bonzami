import { useLoaderData, useParams } from "react-router-dom";

export async function expenseLoader({ params }) {
  const res = await fetch("http://127.0.0.1:8000/api/expenses/" + params.expenseid + "/")
  let dat = await res.json()
  // dat.guid = params.guid // Not needed if layout handles it, or rely on params in component
  // dat.expenseid = params.expenseid 
  // Component uses useLoaderData which returns dat. But Component also uses useParams()
  return dat
}

function ToolHeader({ leftIcon, leftIconOnClick, rightIcon, rightIconOnClick }) {
  return (
    <div className="w-full flex justify-between border-b-2 border-gray-400">
      <div className="text-2xl px-5 rounded-[8px] m-[7px] duration-200 cursor-pointer hover:bg-gray-200" onClick={leftIconOnClick}>
        <i className={leftIcon}></i>
      </div>
      <div className="text-2xl px-5 rounded-[8px] m-[7px] duration-200 cursor-pointer hover:bg-gray-200" onClick={rightIconOnClick}>
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
        leftIcon="ri-arrow-left-line"
        leftIconOnClick={() => { window.location = `/g/${params.guid}` }}
        rightIcon="ri-pencil-fill"
        rightIconOnClick={() => { window.location = `/g/${params.guid}/e/${params.expenseid}/edit` }}
      />
      <div className="bg-white rounded-lg shadow-md p-4 m-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="text-2xl font-bold">{expense.name}</div>
            <div className="text-gray-500">paid by {expense.by_uname}</div>
          </div>
          <div className="flex-none">
            <div className="text-2xl font-bold">{expense.amount} €</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-xl font-bold mb-4">Shares</div>
        <div className="flex">
          <div className="w-full md:w-11/12 md:ml-auto">
            {
              expense.shares.map((share, index) => (
                <div className="flex mb-2" key={index}>
                  <div className="flex-1 text-right pr-4 font-bold">{share.uname}</div>
                  <div className="flex-1">{share.share}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}