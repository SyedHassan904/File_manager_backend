import mongoose from "mongoose";

const UserSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    dataUsed:{
        type:Number,
        default:0
    }
});

const UserModel = mongoose.models.user || mongoose.model('user',UserSchema);

export default UserModel;