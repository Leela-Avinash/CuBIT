import express from "express";
import {
    signUp,
    login,
    forgotPassword,
    resetPassword,
    checkAuth,
    logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/logout", logoutUser);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check-auth", protect, checkAuth);

export default router;
