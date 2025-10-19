import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createContext, useContext } from 'react';
import "./style.css"
import Layout from './components/Layout/Layout';
import Test from './components/Test/Test';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';

export const SettingsContext = createContext();

const SettingsProvider = ({ children }) => {

  const [settings, setSettings] = useState({
    username: "",
    loggedIn: false,
    sessionToken: ""
  });

  return (
    <SettingsContext.Provider value={[settings, setSettings]}>
      { children }
    </SettingsContext.Provider>
  );
}


const router = createBrowserRouter([
{
  path: "/",
  element: <Layout />,
  errorElement: null,
  children: [
    {
      path: "/test",
      element: <Test />
    }
  ]
},
{
  path: "/register",
  element: <Register />
},
{
  path: "/login",
  element: <Login />
}
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
    <RouterProvider router={router}/>
    </SettingsProvider>
  </StrictMode>,
)
