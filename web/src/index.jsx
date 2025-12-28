import * as React from "react";
import * as ReactDOM from "react-dom/client";

import "./index.css"
import ExpenseList, { expenseListLoader } from "./pages/ExpenseList"

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ExpenseEditor, { expenseEditorLoader } from "./pages/ExpenseEditor";
import StatsView, { statsLoader } from "./pages/StatsView";
import SettleUpView, { settleUpLoader } from "./pages/SettleUpView";
import CustomContainer from "./pages/CustomContainer";


const router = createBrowserRouter([
  {
    path: "/",
    element: <CustomContainer />,
    children: [
      {
        path: "/g/:guid",
        element: <ExpenseList />,
        loader: expenseListLoader
      },

      {
        path: "/g/:guid/new",
        element: <ExpenseEditor />,
        loader: expenseEditorLoader
      },
      {
        path: "/g/:guid/e/:expenseid/edit",
        element: <ExpenseEditor />,
        loader: expenseEditorLoader
      },
      {
        path: "/g/:guid/stats",
        element: <StatsView />,
        loader: statsLoader
      },
      {
        path: "/g/:guid/settle-up",
        element: <SettleUpView />,
        loader: settleUpLoader
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
