import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import expenseRoutes from "./routes/expenseRoutes.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
app.use(express.json())
app.use(cors());
const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Body:", req.body);
  next();
});

mongoose.connect(process.env.DB_URL)
    .then(() => console.log("connected to MongoDB"))
    .catch(err => console.error("MongoDB connection failed",err));

app.get("/",(req,res) => {
    res.send("Vault backend running");
})

app.use("/api/expenses", expenseRoutes);

app.listen(PORT, () => console.log(`Server is Live on ${PORT}`));