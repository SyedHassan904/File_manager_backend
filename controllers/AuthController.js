import UserModel from "../models/UserModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { createJWT } from "../utils/CreateJWT.js";

const RegisterUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await UserModel.findOne({ email });
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "please enter valid email" });
        }
        if (user) {
            return res.json({ success: false, message: "user is already register" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "please enter password more than 8 characters" })
        }
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                const user = await UserModel.create({
                    name,
                    email,
                    password: hash,
                })
                const token = createJWT(user)
                res.status(201).json({ success: true, message: 'User registered', user: { name: user.name, email: user.email, token: token } });
            })
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


const LoginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid Ceredentials" });
        }
        const compare = await bcrypt.compare(password, user.password);
        if (compare) {
            const token = createJWT(user);
            res.json({ success: true, message: "login Success" , token:token,user:user})
        } else {
            return res.json({ success: false, message: "Invalid Ceredentials" })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


const getUserData = async (req, res) => {
  try {
    const userId = req.user.id; // assuming you set req.user in your auth middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId).select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dataUsed: user.data, // in bytes
      },
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default {RegisterUser,LoginUser, getUserData};