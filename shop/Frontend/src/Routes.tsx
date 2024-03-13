import { useEffect } from "react";
import { createBrowserRouter, Outlet, useNavigate } from "react-router-dom";

import Cart from "./Routes/Cart";
import Login from "./Routes/Login";
import Products from "./Routes/Products";
import Admin from "./Routes/Admin";
import Register from "./Routes/Register";
import Logout from "./Routes/Logout";
import Settings from "./Routes/Settings";
import Orders from "./Routes/Orders";

const Protector = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname == "/") navigate("/products");
  }, []);

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Protector />,
    errorElement: <Protector />,
    children: [
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/admin",
        element: <Admin />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
]);

export default router;
