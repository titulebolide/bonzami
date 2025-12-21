import * as React from "react";
import * as ReactDOM from "react-dom/client";

import "./index.css"
import ExpenseList, {expenseListLoader} from "./pages/ExpenseList"

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Expense, {expenseLoader} from "./pages/Expense";
import ExpenseEditor, {expenseEditorLoader} from "./pages/ExpenseEditor";
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
        path: "/g/:guid/e/:expenseid",
        element: <Expense />,
        loader: expenseLoader
      },
      {
        path: "/g/:guid/e/:expenseid/edit",
        element: <ExpenseEditor />,
        loader: expenseEditorLoader
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
