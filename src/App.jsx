import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './App.css'
import Layout from './Layout';
import Landing from './pages/Landing';
import MetroRoutePlanner from './pages/MetroRoutePlanner';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, 
    children: [
      {
        index: true,
        element: <Navigate to="/homepage" />
      },
      {
        path: "/homepage",
        element:<Landing />
      },
      {
        path: "/plan",
        element:<MetroRoutePlanner />
      },
    ]
  },

]);

function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
