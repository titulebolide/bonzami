import { Outlet } from "react-router-dom"

export default function CustomContainer() {
  return (
    <div className="max-w-[600px] mx-auto p-4">
      <Outlet />
    </div>
  )
}
