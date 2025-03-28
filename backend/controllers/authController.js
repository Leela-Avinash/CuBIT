import User from "../models/User.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { sendResetEmail } from "../utils/emailService.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30minutes",
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
    try {
        const { token, newPassword } = req.body;
        console.log("Resetting password with token:", token);
        console.log("New password:", newPassword);

        if (!token) {
            res.status(400).json({ success: false, message: "Token is required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            res.status(400).json({success:false, message:"Invalid or expired token"});
        }
        console.log("Decoded token:", decoded);
        // Get the user based on the email included in the token
        const user = await User.findOne({ _id: decoded.id });
        console.log(user)
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        user.password = newPassword;
        await user.save();
        console.log("Password updated successfully for user:", user.username);
        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.log("Error resetting password:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
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
    console.log("Logging out user...");
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
        sameSite: "strict",
        path: "/", // ensure the path matches where the cookie was set
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
};
