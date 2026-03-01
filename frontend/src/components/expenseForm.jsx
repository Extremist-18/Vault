import {useState} from "react";
// import CryptoJS from "crypto-js";
import { encryptData, decryptData } from "../utils/cryptoHelper";
import {ethers} from "ethers";
import vaultLedgerABI from "../blockchain/artifacts/contracts/vaultLedger.sol/VaultLedger.json";
import axios from "axios";

export default function AddExpenseForm({setExpense}){
    const [formData, setFormData] = useState({description:"",amount:"",category:""});
    const [loading, setLoading] = useState(false);
    const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
    const RPC_URL = process.env.REACT_APP_RPC_URL;
    console.log("Contract address:", CONTRACT_ADDRESS);

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setLoading(true);
        try{
            const newExpense = {...formData,amount: Number(formData.amount),
                date: new Date().toISOString(),
            };

            // const provider = new ethers.JsonRpcProvider(RPC_URL);
            // const accounts = await provider.listAccounts();
            // const signer = await provider.getSigner(accounts[0]);
            // const wallet = await signer.getAddress();

            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);

            const encrypted = await encryptData(newExpense, wallet);
            const encryptedString =JSON.stringify(encrypted);
            const dataHash = ethers.keccak256(ethers.toUtf8Bytes(encryptedString));
            
            const token = localStorage.getItem("token") || localStorage.getItem("authToken");
            if(!token){
                alert("Please Login First");
                setLoading(false);
                return;
            }
            const res = await axios.post("http://localhost:5050/api/expenses/add", {  
                encryptedData: {
                        iv: encrypted.iv,
                        ciphertext: encrypted.ciphertext,
                    },
                },{
                    headers:{Authorization:`Bearer ${token}`},
                }
            );
            const data = res.data;
            const contract = new ethers.Contract(CONTRACT_ADDRESS,vaultLedgerABI.abi, wallet);
            const tx = await contract.addExpense(dataHash);
            await tx.wait();

            console.log("Expense stored in Blockchain and Backend");
            setExpense((prev) => [...(prev || []), data]);
            setFormData({ description: "", amount: "", category: "" });
        }catch(err){
            console.error("Error adding Expense",err);
            alert("Failed to Add expense");
        }finally{
            setLoading(false);
        }  
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-cyan-400">Add Expense</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder="Description"
                    value={formData.description}
                    onChange = {(e)=> setFormData({...formData,description:e.target.value})}
                    className="bg-gray-900 text-gray-100 p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                />

                <input
                    type="number"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange = {(e)=> setFormData({ ...formData, amount:e.target.value})}
                    className="bg-gray-900 text-gray-100 p-3 rounded-xl border border-gray-700 focus:ring-2 focus:ring-cyan-400"
                    required
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e)=>setFormData({...formData, category:e.target.value})}
                    className="bg-gray-900 text-gray-100 p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-cyan-400"
                    required
                />
                </div>
                <div className="flex justify-center mt-4">
                <button
                type="submit"
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
                        loading? "bg-cyan-800 cursor-not-allowed": "bg-cyan-500 hover:bg-cyan-600"}`}>
                    {loading ? "Adding..." : "Add Expense"}
                </button>
            </div>      
        </form>   
    );
}