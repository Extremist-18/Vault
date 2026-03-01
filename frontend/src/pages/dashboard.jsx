import {useState, useEffect } from "react";
import AddExpenseForm from "../components/expenseForm";
import ExpenseCard from "../components/expenseCard";
import {decryptData} from "../utils/cryptoHelper.js";
import {ethers} from "ethers";
import axios from "axios";

export default function Dashboard(){
    const [expenses,setExpenses] = useState([]);
    useEffect(()=>{
        const fetchAndDecrypt = async() =>{
            try{
                const token =localStorage.getItem("token");
                if(!token)  return;
                const res = await fetch("http://localhost:5050/api/expenses/get",{
                    headers:{Authorization:`Bearer ${token}`},
                });
                const data = await res.json();

                const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
                const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);

                const decryptExpenses = await Promise.all(
                    data.map(async(exp)=>{
                        try{
                            const encrypted = typeof exp.encryptedData === "string"
                              ? JSON.parse(exp.encryptedData): exp.encryptedData;
                            const decrypted =  await decryptData(encrypted, wallet);
                            return {...exp, ...decrypted};
                        }catch(err){    
                            console.log("Failed to Decrypt", err);
                        }
                    })
                );

                setExpenses(decryptExpenses.filter(Boolean));
            }catch(err){
                console.log("Failed to Fetch!", err);
            }
        };
        fetchAndDecrypt();
    },[]);
    return (
    <div className="max-w-6xl mx-auto space-y-8">
      <AddExpenseForm setExpense={setExpenses} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenses.length > 0 ? (
          expenses.map((exp) => <ExpenseCard key={exp._id} expense={exp} />)
        ) : (
          <p className="text-gray-400 text-center col-span-full">
            No expenses yet — add one above!
          </p>
        )}
      </div>
    </div>
  );
}