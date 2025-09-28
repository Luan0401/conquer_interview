import React from "react";
import AppHeader from "../Header";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <AppHeader />

      <Outlet />
    </>
  );
}

export default Layout;
