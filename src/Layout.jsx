import { Outlet } from "react-router-dom";
import Navbar from "./features/Navbar";

export default function Layout() {
  return (
    <main>
      <Navbar />
        <Outlet />
    </main>
  )
}
