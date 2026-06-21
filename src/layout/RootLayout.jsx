import HeaderComponent from "../components/header";
import FooterComponent from "../components/footer";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div>
      <HeaderComponent />

      <main className="flex-1 bg-[#eaf3fb]">
        <Outlet />
      </main>

      <FooterComponent />
    </div>
  )
}

export default RootLayout
