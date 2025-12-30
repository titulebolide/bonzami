import { Outlet, useNavigation } from "react-router-dom"
import Header from "../components/Header"

export default function CustomContainer() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const isSettleUpTarget = navigation.location?.pathname.includes("settle-up");
  const showSpinner = isLoading && isSettleUpTarget;

  return (
    <div>
      <Header />
      <div className="max-w-[600px] mx-auto p-4">
        <Outlet />
      </div>

      {showSpinner && (
        <div className="fixed inset-0 top-16 z-30 bg-white/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
