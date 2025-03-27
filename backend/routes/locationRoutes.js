import express from "express";
import {
    getLocationHistory,
    addLocationRecord,
} from "../controllers/locationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/history/:deviceId", protect, getLocationHistory);
router.post("/history/:deviceId", protect, addLocationRecord);

export default router;
