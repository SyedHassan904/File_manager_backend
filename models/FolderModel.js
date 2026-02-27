import mongoose from "mongoose";

const FolderSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    title:{
        type:String,
        required:true
    },
    items:{
        type:Number,
        default:0,
    },
    size:{
        type:Number, //Bytes
        default:0
    },
    isEdit:{
        type:Boolean,
        default:false
    }
});

const FolderModel = mongoose.models.folder || mongoose.model("folder",FolderSchema);

export default FolderModel;