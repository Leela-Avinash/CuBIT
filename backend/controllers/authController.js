import User from "../models/User.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { sendResetEmail } from "../utils/emailService.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signUp = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        username,
        email,
        password,
    });

    if (user) {
        const token = generateTokenAndSetCookie(user._id, res);
        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
            token: token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const token = generateTokenAndSetCookie(user._id, res);
        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
            token: token,
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

// @desc    Forgot Password (simulate sending reset email)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Generate reset token (here using JWT for simplicity)
    const resetToken = generateToken(user._id);

    await sendResetEmail(email, resetToken);

    res.json({ message: "Password reset email sent (simulation)", resetToken });
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
});

export const checkAuth = (req, res) => {
    console.log(req.user);
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
};

export const logoutUser = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0), 
        sameSite: "strict",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
};
