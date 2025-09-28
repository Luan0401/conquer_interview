import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./components/Home";
import AppHeader from "./components/Header";
import Layout from "./components/layout";
import Practice from "./pages/practice";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/header",
        element: <AppHeader />,
      },
      {
        path: "/practice",
        element: <Practice />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
