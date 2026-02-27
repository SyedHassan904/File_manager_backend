import mongoose from "mongoose";

function connectDB(){
    mongoose.connection.on("connected",()=>{
        console.log("DB connected");
    });

    mongoose.connect(process.env.MongoDB_URL);
}

export default connectDB;