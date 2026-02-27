import mongoose, { Schema } from "mongoose";

const FileSchema = mongoose.Schema({
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "folder",
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    title: {
        type: String
    },
    size: {
        type: Number
    },
    fileUrl:{
        type:String
    },
    type: {
        type: String,
        enum: ["doc", "image", "music", "video"],
        required: true,

    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const FileModel = mongoose.models.file || mongoose.model('file',FileSchema);

export default FileModel;