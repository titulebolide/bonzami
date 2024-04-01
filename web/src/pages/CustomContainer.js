import { Outlet } from "react-router-dom"

export default function CustomContainer() {
  return (
    <section className="section">
      <div className="container" style={{maxWidth:600}}>
        <Outlet />
      </div>
    </section>
  )
}
