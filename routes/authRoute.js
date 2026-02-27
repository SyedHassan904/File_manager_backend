import express from 'express';
const authRoute=express.Router();
import AuthController from '../controllers/AuthController.js';
import isAuth from '../middleware/isAuth.js';

const {RegisterUser,LoginUser,getUserData}=AuthController;

authRoute.post("/register",RegisterUser);
authRoute.post("/login",LoginUser);
authRoute.get("/me",isAuth,getUserData);

export default authRoute;