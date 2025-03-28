import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import Device from "./models/Device.js";
import LocationHistory from "./models/LocationHistory.js";
import { Server } from "socket.io";

dotenv.config();

const app = express();
app.use(cookieParser());

// Connect Database
connectDB();

// Middleware
const corsOptions = {
    origin: `https://cubit2k25.vercel.app`,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Ensure headers are explicitly allowed
    exposedHeaders: ["set-cookie"], // ✅ Allows frontend to see cookies in response headers
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    console.log("API is running...");
    res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/location", locationRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// WebSocket setup
const io = new Server(server, {
    cors: {
        origin: `https://cubit2k25.vercel.app`,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"], // ✅ Ensure headers are explicitly allowed
        exposedHeaders: ["set-cookie"], // ✅ Allows frontend to see cookies in response headers
    },
});

io.on("connection", (socket) => {
    console.log("WebSocket client connected");

    // Existing updateLocation event remains unchanged.
    socket.on("updateLocation", async (data) => {
        const { deviceId, latitude, longitude, date, time, batteryVoltage } =
            data;
        try {
            const device = await Device.findById(deviceId);
            if (!device) {
                socket.emit("error", { message: "Device not found" });
                return;
            }
            const locationRecord = await LocationHistory.create({
                device: deviceId,
                latitude,
                longitude,
                date,
                time,
                batteryVoltage,
            });
            device.lastLocation = {
                latitude,
                longitude,
                date,
                time,
                batteryVoltage,
            };
            await device.save();
            io.emit("locationUpdated", {
                deviceId,
                lastLocation: device.lastLocation,
            });
        } catch (error) {
            console.error("Error updating location:", error.message);
        }
    });

    // New: When client requests device location using "getDeviceLocation",
    // fetch the location and then emit "getDeviceLocation" with the result.
    socket.on("getDeviceLocation", async (data) => {
        try {
            const { deviceId } = data;
            const device = await Device.findById(deviceId);
            if (!device) {
                socket.emit("getDeviceLocation", { error: "Device not found" });
            } else {
                socket.emit("getDeviceLocation", {
                    deviceId,
                    lastLocation: device.lastLocation,
                });
            }
        } catch (error) {
            socket.emit("getDeviceLocation", { error: error.message });
        }
    });

    socket.on("disconnect", () => {
        console.log("WebSocket client disconnected");
    });
});
