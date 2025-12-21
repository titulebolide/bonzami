import { Outlet } from "react-router-dom"

export default function CustomContainer() {
  return (
    <div className="container" style={{maxWidth:600}}>
      <Outlet />
    </div>
  )
}
