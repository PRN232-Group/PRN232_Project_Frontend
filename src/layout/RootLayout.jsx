import HeaderComponent from "../components/header";
import FooterComponent from "../components/footer";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--cream)]">
      <HeaderComponent />

      <main className="flex-1">
        <Outlet />
      </main>

      <FooterComponent />
    </div>
  )
}

export default RootLayout
