import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import Layout from "./Layout";
import MetroRoutePlanner from "./pages/MetroRoutePlanner";
import { useEffect } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/homepage" />,
      },
      {
        path: "/homepage",
        element: <MetroRoutePlanner />,
      },
    ],
  },
]);

function App() {
  useEffect(() => {
    document.title = "How To Metro";
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
