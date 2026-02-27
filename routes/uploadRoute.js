import express from 'express';
const uploadRouter= express.Router();
import upload from '../middleware/multer.js';
import uploadController from '../controllers/uploadController.js';
import isAuth from '../middleware/isAuth.js';

const {uploadFiles,addFolder,getAllFiles,getAllFolders,deleteFolder,fetchtypeFiles,updateFolderName,deleteFile, updateFileTitle}=uploadController;

uploadRouter.post('/upload',isAuth,upload.single('file'),uploadFiles);
uploadRouter.get('/getFiles/:folderId',isAuth,getAllFiles);
uploadRouter.post('/addFolder',isAuth,addFolder);
uploadRouter.get('/getFolders',isAuth,getAllFolders);
uploadRouter.delete('/deleteFolder/:id',isAuth,deleteFolder);
uploadRouter.put('/updateFolderTitle/:id',isAuth,updateFolderName);
uploadRouter.delete('/deleteFile/:fileId',isAuth,deleteFile);
uploadRouter.put('/editFile/:fileId',isAuth,updateFileTitle);
uploadRouter.get('/files/:type',isAuth,fetchtypeFiles);

export default uploadRouter;