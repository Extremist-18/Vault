import express from "express";
import {addExpense,getExpense,updateExpense,deleteExpense,getInsights} from "../controllers/expenseController.js";
import jwt from "jsonwebtoken";

const router =express.Router();
const JWT_SECRET = "KEY";

function verifyToken(req,res,next){
    const token =req.headers.authorization?.split(" ")[1];
    if(!token)
        return res.status(401).json({message:"No token Provided"});

    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        req.userId = decoded.id;
        next();
    }catch(err){
        res.status(403).json({message:"Invalid Token"});
    }
}

router.post("/add",verifyToken, addExpense);
router.get("/get",verifyToken, getExpense);
router.put("/update/:id",verifyToken, updateExpense);
router.delete("/delete/:id",verifyToken, deleteExpense);
router.get("/insights",verifyToken, getInsights);

export default router;
