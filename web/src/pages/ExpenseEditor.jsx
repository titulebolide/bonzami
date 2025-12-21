import { useLoaderData } from "react-router-dom";

export async function expenseEditorLoader({ params }) {
  const groupData = await fetch("http://127.0.0.1:8000/api/groups/" + params.guid + "/")
  return await groupData.json()
}

export default function ExpenseEditor() {
  const groupData = useLoaderData();

  console.log(groupData.uids)

  return (
    <div className="m-[10px_20px]">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
        <div className="relative mx-3">
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Expense name" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Payer</label>
        <div className="relative mx-3">
          <div className="relative">
            <select className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
              {
                Object.entries(groupData.uids).map(([uid, name], i) => (
                  <option key={uid}>{name}</option>
                ))
              }
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
        <div className="flex mx-3 items-center">
          <div className="flex-1 relative">
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="54" />
          </div>
          <div className="flex-none w-1/6 ml-2 text-center text-xl">€</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Shares</label>
        <div>
          {
            Object.entries(groupData.uids).map(([uid, name], i) => (
              <div key={uid}>
                {i !== 0 && <div className="w-3/4 h-[1px] bg-[#777] relative mx-auto my-3"></div>}
                <div className="flex items-center">
                  <div className="flex-1 capitalize flex items-center">
                    {name}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" defaultValue="1" />
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
