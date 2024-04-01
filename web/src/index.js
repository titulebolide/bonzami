import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css"
import ExpenseList, {expenseLoader} from "./pages/ExpenseList"

import { createBrowserRouter, RouterProvider } from 'react-router-dom';


const router = createBrowserRouter([
  {
    path: "/g/:guid",
    element: <ExpenseList />,
    loader: expenseLoader
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
