import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./pages/redux/store.js";
import React from "react";

createRoot(document.getElementById("root")).render(<React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>);
