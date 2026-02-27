import FileModel from "../models/FileModel.js";
import FolderModel from "../models/FolderModel.js";
import mongoose from "mongoose";
import UserModel from "../models/UserModel.js";
import cloudinary from "../config/cloudinary.js";
import path from "path";
import fs from 'fs';


const uploadFiles = async (req, res) => {
    const { title, folderId } = req.body;
    const userId = req.user.id
    const file = req.file;
    let fileUrl = null;
    let fileType = "doc";
    let fileSize=0;
    try {
        if (file) {
            const result = await cloudinary.uploader.upload(file.path, { resource_type: 'auto' });
            fileUrl = result.secure_url;
            fs.unlinkSync(file.path)

            const ext = path.extname(file.originalname).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) fileType = "image";
            else if ([".mp4", ".mov", ".avi"].includes(ext)) fileType = "video";
            else if ([".mp3", ".wav"].includes(ext)) fileType = "music";

            fileSize = result.bytes;

        } else {
            return res.json({ success: false, message: "Please Add File" })
        }
        const newFile = await FileModel.create({
            userId,
            title,
            folderId,
            fileUrl,
            type: fileType,
            size:fileSize
        });
        await FolderModel.findOneAndUpdate(
            {_id:folderId,user:userId},{
                $inc:{
                    items:1,
                    size:fileSize,

                }
            }
        );
        res.json({ success: true, message: "File added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


const getAllFiles = async (req, res) => {
    const { folderId } = req.params;
    const userId  = req.user.id;
    try {
        let files = await FileModel.find({ userId,folderId }).sort({ createdAt: -1 });
        res.json({ success: true, files })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const addFolder = async (req, res) => {
    const { title } = req.body;
    const user = req.user;

    if (!title || title.trim() === "") {
        return res.status(400).json({ success: false, message: "Title is required" });
    }
    try {
        const newFolder = await FolderModel.create(
            {
                user: user.id,
                title
            }
        )
        res.json({ success: true, folder: newFolder })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


const getAllFolders = async (req, res) => {
    const userID = req.user.id;
    try {
        let folders = await FolderModel.find({ user: userID });
        res.json({ success: true, folders })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const deleteFolder = async (req, res) => {
    const { id } = req.params; // folder id
    const userId = req.user.id;

    try {
        // Find all files in the folder
        const files = await FileModel.find({ userId,folderId: id });

        // Delete files from Cloudinary
        for (let file of files) {
            if (file.fileUrl) {
                const publicId = file.fileUrl.split("/").pop().split(".")[0]; // crude extraction
                await cloudinary.uploader.destroy(publicId);
            }
        }

        // Delete files from MongoDB
        await FileModel.deleteMany({ folderId: id });

        // Delete folder
        await FolderModel.findByIdAndDelete(id);

        res.json({ success: true, message: "Folder and files deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const updateFolderName = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        const updatedFolder = await FolderModel.findOneAndUpdate(
            {
                _id: id,
                user: req.user.id   // 🔐 ensures ownership
            },
            {
                title: title
            },
            {
                new: true
            }
        );

        if (!updatedFolder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found or not authorized"
            });
        }

        res.json({
            success: true,
            folder: updatedFolder
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const deleteFile = async (req, res) => {
  const { fileId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ success: false, message: "Invalid file ID" });
  }

  try {
    // 1️⃣ Find the file
    const file = await FileModel.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const folderId = file.folderId;
    const fileSize = file.size || 0;

    // 2️⃣ Map your FileModel type to Cloudinary resource_type
    let resourceType = "raw"; // default for doc/pptx/etc
    if (file.type === "image") resourceType = "image";
    else if (file.type === "music") resourceType = "video"; // Cloudinary uses video for audio
    // "doc" remains raw

    // 3️⃣ Extract public_id from URL
    const publicId = file.fileUrl.split("/").pop().split(".")[0];

    // 4️⃣ Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    // 5️⃣ Delete from DB
    await FileModel.findByIdAndDelete(fileId);

    // 6️⃣ Update folder stats
    await FolderModel.findByIdAndUpdate(folderId, {
      $inc: { items: -1, size: -fileSize },
    });

    return res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const updateFileTitle = async (req, res) => {
  const { fileId } = req.params;
  const { newTitle } = req.body;

  // 1️⃣ Validate ID
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ success: false, message: "Invalid file ID" });
  }

  // 2️⃣ Validate title
  if (!newTitle || newTitle.trim() === "") {
    return res.status(400).json({ success: false, message: "Title cannot be empty" });
  }

  try {
    // 3️⃣ Update file title
    const updatedFile = await FileModel.findByIdAndUpdate(
      fileId,
      { title: newTitle },
      { new: true } // return updated document
    );

    if (!updatedFile) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    return res.json({ success: true, message: "File title updated", file: updatedFile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const fetchtypeFiles=async (req, res) => {
  const { type } = req.params;
  const userId = req.user.id;

  if (!type || !userId) {
    return res.status(400).json({ error: "Missing type or userId" });
  }

  try {
    // Fetch files of this type for this user
    const files = await FileModel.find({ type, userId });

    res.status(200).json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Server error" });
  }
}
export default { uploadFiles, getAllFiles, addFolder, getAllFolders, deleteFolder, updateFolderName, deleteFile, updateFileTitle, fetchtypeFiles };