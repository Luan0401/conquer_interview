import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home";
import AppHeader from "./components/Header";
import Layout from "./components/layout";
import Practice from "./pages/practice";
import Pricing from "./pages/pricing";
import Support from "./pages/support";
import Feedback from "./pages/feedback";
import LoginPage from "./pages/login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // nhớ import CSS
import RegisterPage from "./pages/register";
import InterviewPage from "./pages/imterviewPage";
import ReportInterview from "./pages/ReportInterview";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/header", element: <AppHeader /> },
      { path: "/practice", element: <Practice /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/support", element: <Support /> },
      { path: "/feedback", element: <Feedback /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/InterviewPage", element: <InterviewPage /> },
      { path: "/ReportInterview", element: <ReportInterview /> },
    ],
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" 
      />
    </>
  );
}
