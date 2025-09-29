import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home";
import AppHeader from "./components/Header";
import Layout from "./components/layout";
import Practice from "./pages/practice";
import Pricing from "./pages/pricing";
import Support from "./pages/support";
import Feedback from "./pages/feedback";

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
      {
        path: "/pricing",
        element: <Pricing />,
      },
      {
        path: "/support",
        element: <Support />,
      },
      {
        path: "/feedback",
        element: <Feedback />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
