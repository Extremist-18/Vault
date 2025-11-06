import { group } from "console";
import Expense from "../model/expenseModel.js";

export const addExpense = async(req,res) =>{
    try{
        const {encryptedData } = req.body;
        if(!encryptedData || !encryptedData.iv || !encryptedData.ciphertext){
            return res.status(400).json({message:"Missing encryptedData"});
        }
        const expense = await Expense.create({
            encryptedData: {
                iv: encryptedData.iv,
                data: encryptedData.ciphertext,
            },
            userId : req.userId,
        });
        res.status(201).json(expense);
    }catch(err){
        res.status(400).json({message: err.message});
    }
};

export const getExpense = async(req,res) =>{
    try{
        const expenses =await Expense.find({userId:req.userId});
        res.json(expenses);
    }catch(err){
        res.status(500).json({message: err.message});
    }
};

export const updateExpense = async(req, res) =>{
    try{
        const {id} = req.params;
        const updatedExpense = await Expense.findByIdAndUpdate({_id:id, userId :req.userId}, req.body,{new:true});
        res.json(updatedExpense);
    }catch(err){
        res.status(401).json({message:err.message});
    }
};

export const deleteExpense = async(req,res) =>{
    try{    
        const {id} = req.params;
        await Expense.findOneAndDelete({id:id, userId : req.userId});
        res.json({message: "Expense Deleted Successfully"});
    }catch(err){
        res.status(402).json({message:err.message});
    }
}

export const getInsights = async(req,res) =>{
    try{
        const insight = await Expense.aggregate([
            {$match:{userId: req.userId}},
            {$group: {_id : "$category", totalSpent : {$sum:"$amount"}}}
        ]);
        res.json(insight);
    }catch(err){
        res.status(403).json({message: err.message});
    }
};
