import express from "express";
import {
    addDevice,
    getDeviceLocation,
    getUserDevices,
} from "../controllers/deviceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserDevices);
router.post("/add", protect, addDevice);
router.get("/location/:deviceId", protect, getDeviceLocation);

export default router;
