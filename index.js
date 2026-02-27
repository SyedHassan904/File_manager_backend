import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
dotenv.config();
import cloudinary from './config/cloudinary.js';
import connectDB from './config/mongodb.js';
import authRoute from './routes/authRoute.js';
import uploadRouter from './routes/uploadRoute.js';

connectDB();


const app = express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hello")
})

app.use("/user",authRoute);
app.use("/folder",uploadRouter);

app.listen(3000,()=>{
    console.log(`server runs on http://localhost:3000`)
})