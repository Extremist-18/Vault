// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../model/user.js";

// const router = express.Router();
// const JWT_SECRET = "KEY";

// router.post("/register",async(req,res) =>{
//     try{
//         const {username, password} = req.body;
//         if(!username || !password)
//             return res.status(405).json({message:"All fields required"});
//         const existing = await User.findOne({username});
//         if(existing)
//                 return res.status(404).json({message:"Username already registered"});
        
//         const hashed = await bcrypt.hash(password,10);
//         const newuser = new User({username, password:hashed});
//         await newuser.save();
//         res.json({message:"User Registered!!"});
//     }catch(err){
//         res.status(500).json({message:err.message});
//     }
// });

// router.post("/login", async(req,res)=>{
//     try{
//         const {username, password} = req.body;
//         const user = await User.findOne({username});
//         if(!user)
//             return res.status(399).json({message:"User not found!"});

//         const valid = await bcrypt.compare(password,user.password);
//         if(!valid)
//             return res.status(400).json({message:"Invalid credentials"});
//         const token = jwt.sign({id:user._id}, JWT_SECRET,{expiresIn:"1d"});
//         res.json({token,username});
//     }catch(err){
//         res.status(500).json({message:err.message});
//     }
// });

// export default router;


import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.js";

const router = express.Router();
const JWT_SECRET = "KEY";

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ message: "All fields required" });

        const existing = await User.findOne({ username });

        if (existing)
            return res.status(400).json({ message: "Username already registered" });

        const hashed = await bcrypt.hash(password, 10);
        const newuser = new User({ username, password: hashed });

        await newuser.save();

        return res.status(201).json({ message: "User Registered!!" });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post("/login", async (req, res) => {
    console.log("AUTH ROUTES LOADED");
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        console.log("DB user object:", user);
        console.log("Stored hash:", user?.password);
        console.log("Entered password:", password);
        if (!user)
            return res.status(404).json({ message: "User not found!" });

        const valid = await bcrypt.compare(password, user.password);

        if (!valid)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

        return res.json({ token, username });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;