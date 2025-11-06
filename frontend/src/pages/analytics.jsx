import React,{useEffect, useState} from "react";
import axios from "axios";
import {PieChart,Pie,Cell,Tooltip, ResponsiveContainer,BarChart,Bar,XAxis,YAxis, CartesianGrid} from "recharts";
import { decryptData } from "../utils/cryptoHelper";
import {ethers} from "ethers";

const COLORS = ["#06b6d4", "#3b82f6", "#f97316", "#10b981", "#ef4444", "#8b5cf6"];

export default function Analytics(){
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [summary, setSummary] = useState({total:0, average:0});

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [walletAddress, setWalletAddress] = useState("");

    useEffect(()=>{
        initWalletAndFetch();
    },[]);
    const initWalletAndFetch = async ()=>{
        try{
            // const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            // const signer = await provider.getSigner(0);
            // const address = await signer.getAddress();
           
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);

            setWalletAddress(wallet); 
            await fetchExpenseData(wallet);
        }catch(err){
            console.error("Wallet connection Error",err);
        }
    };

    const decryptExpense = async (encryptedData, walletAddress)=>{
        try{
            // const key = CryptoJS.SHA256(walletAddress).toString();
            // const bytes = CryptoJS.AES.decrypt(encrypted,key);
            // const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            // return JSON.parse(decryptedText);
            return await decryptData(encryptedData, walletAddress);
        }catch(err){
            console.error("Decryption Error", err);
            return null;
        }
    }

    const fetchExpenseData = async(address)=>{
        try{
            const token = localStorage.getItem("token");
            if(!token){
                console.error("Token not found");
                return;
            }
            const res = await axios.get("http://localhost:5000/api/expenses/get", {
                headers: {
                    Authorization: `Bearer ${token}`, // << include token here
                },
            });
            const exp = res.data || [];
            
            const decryptedExpenses = (
                await Promise.all(
                exp.map(async (item) => {
                    let encryptedObj=null;
                    try {
                    if (typeof item.encryptedData === "string") {
                        encryptedObj = JSON.parse(item.encryptedData);
                    } else if (item.encryptedData && item.encryptedData.iv 
                        // (item.encryptedData.data || item.encryptedData.ciphertext)
                    ) {
                        // supports { iv, data } or { iv, ciphertext }
                        encryptedObj = {
                        iv: item.encryptedData.iv,
                        ciphertext:
                            item.encryptedData.data || item.encryptedData.ciphertext,
                        };
                    } else if (item.iv && (item.data || item.ciphertext)) {
                        encryptedObj = {
                        iv: item.iv,
                        ciphertext: item.data || item.ciphertext,
                        };
                    } else {
                        console.warn("Invalid encrypted object:", item);
                        return null;
                    }

                    return await decryptExpense(encryptedObj, address);
                    } catch (err) {
                    console.error("Error decrypting item:", err);
                    return null;
                    }
                })
                )
            ).filter(Boolean);

            console.log("Decrypted Expense", decryptedExpenses);

            let filtered = decryptedExpenses;
            if(startDate){
                filtered = filtered.filter(
                    (e) => new Date(e.date) >= new Date(startDate)
                );
            }
            if(endDate){
                filtered = filtered.filter(
                    (e)=>new Date(e.date) <= new Date(endDate)
                );
            }
            if(selectedCategory !=="all"){
                filtered = filtered.filter(
                    (e)=> e.category === selectedCategory
                );
            }

            const categoryTotals = {};
            filtered.forEach((exp) => {
                categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
            });
            const catData = Object.entries(categoryTotals).map(([category, value]) => ({
                category, value,
            }));

            const monthlyTotals = {};
            filtered.forEach((exp)=>{
                const month =new Date(exp.date).toLocaleString("default",{month:"short"});
                monthlyTotals[month] = (monthlyTotals[month]||0)+exp.amount;
            });

            const monthlyData = Object.entries(monthlyTotals).map(([month, total]) => ({
                month, total,
            }));

            const total = filtered.reduce((acc,e) => acc +e.amount,0);
            const average = total/filtered.length ||0;
            
            setCategoryData(catData);
            setMonthlyData(monthlyData);
            setSummary({total,average});

        }catch(err){
            console.error("Error fetching expense data:", err);
        }
    };

    return(
        <div className=" p-6 space-y-8">
            <h1 className="text-3xl font-semibold text-gray-200 font-serif">Analytics Dashboard</h1>
            
            <div className="flex flex-col md:flex-row gap-3 text-gray-800 items-center mb-6">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border p-2 rounded-md"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border p-2 rounded-md"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border p-2 rounded-md"
                >
                    <option value="all">All Categories</option>
                    {[...new Set(categoryData.map((c) => c.category))].map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                    ))}
                </select>
                <button
                    onClick={ ()=>fetchExpenseData(walletAddress)}
                    className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600"
                >
                    Apply Filters
                </button>
                </div>



            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-gray-500">Total Spendings</p>
                    <h2 className="text-2xl font-bold text-teal-500">Rs {summary.total.toFixed(2)}</h2>
                </div>
                <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-gray-500">Average per Expense</p>
                    <h2 className="text-2xl font-bold text-teal-500">Rs {summary.average.toFixed(2)}</h2>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Spending by Category</h2>
                <ResponsiveContainer width= "100%" height={300}>
                    <PieChart>
                        <Pie
                            data ={categoryData}
                            dataKey="value"
                            nameKey="category"
                            outerRadius={120}
                            fill="#06b6d4"
                            label
                        >
                            {categoryData.map((_,index) =>(
                                <Cell key={`cell-${index}`} fill={COLORS[index%COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip/>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Expense Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="total" fill="#3b82f6" radius={[8,8,0,0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}