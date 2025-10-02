import React from "react";
import AppHeader from "../Header";
import { Outlet, useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();

  // Danh sách route không hiển thị header
  const noHeaderRoutes = ["/login", "/register"];

  const hideHeader = noHeaderRoutes.includes(location.pathname);
  return (
    <>
      {!hideHeader && <AppHeader />}
      <Outlet />
    </>
  );
}

export default Layout;
