
import {useState,useEffect} from "react";
import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import Navbar from "./components/navbar";
import Dashboard from "./pages/dashboard";
import Analytics from "./pages/analytics";
import Settings from "./pages/settings";
import AddExpenseForm from "./components/expenseForm";
import Login from "./pages/login";
import Register from "./pages/register";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}


export default function App(){
  const [expenses,setExpense] = useState([]);

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/expenses/get")
      .then((res)=>res.json())
      .then((data)=>setExpense(data))
      .catch((err)=> console.error("Error fectching Expense:", err));
  },[]);

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center">
      {token && <Navbar username={username} setExpense={setExpense} />}

      <main className="flex flex-col items-center p-6 w-full max-w-5xl">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard expenses={expenses} setExpense={setExpense} />
              </PrivateRoute>
            }
          />
          <Route
            path="/add"
            element={
              <PrivateRoute>
                <AddExpenseForm setExpense={setExpense} />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
