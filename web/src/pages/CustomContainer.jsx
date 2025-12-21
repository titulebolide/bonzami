import { Outlet } from "react-router-dom"
import Header from "../components/Header"

export default function CustomContainer() {
  return (
    <div>
      <Header />
      <div className="max-w-[600px] mx-auto p-4">
        <Outlet />
      </div>
    </div>
  )
}
