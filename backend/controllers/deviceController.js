import Device from "../models/Device.js";
import asyncHandler from "express-async-handler";

// @desc    Add or update a device for the authenticated user
// @route   POST /api/device/add
// @access  Private
export const addDevice = asyncHandler(async (req, res) => {
    const { deviceId, activationKey, deviceName } = req.body;

    // Check if the device already exists for this user
    const existingDevice = await Device.findOne({
        deviceId,
        user: req.user._id,
    });
    if (existingDevice) {
        console.log("oh nooooo")
        // If activation key is different, update it (and optionally update deviceName)
        if (existingDevice.activationKey !== activationKey) {
            existingDevice.activationKey = activationKey;
            if (deviceName) {
                existingDevice.deviceName = deviceName;
            }
            await existingDevice.save();
            return res.json({
                success: true,
                device: existingDevice,
                message: "Activation key updated",
            });
        } else {
            // If the activation key is the same, you can decide to return an error or just return the existing device
            return res.status(400).json({
                success: false,
                message: "Device already exists with the same activation key",
            });
        }
    }
    console.log("hereeeeee")
    // If device does not exist, create a new device record
    const device = await Device.create({
        deviceId,
        activationKey,
        deviceName, // Optional field
        user: req.user._id,
    });
    console.log("Hello")
    console.log(device);
    if (!device) {
        res.status(400);
        throw new Error("Failed to create device");
    }

    res.status(201).json({
        success: true,
        device,
    });
});

// @desc    Get device’s last known location
// @route   GET /api/device/location/:deviceId
// @access  Private
export const getDeviceLocation = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const device = await Device.findOne({ _id: deviceId, user: req.user._id });
    if (!device) {
        res.status(404);
        throw new Error("Device not found");
    }
    if (!device.lastLocation) {
        res.status(404);
        throw new Error("No location data available for this device");
    }
    res.json(device.lastLocation);
});

// @desc    Get all devices for the authenticated user
// @route   GET /api/device
// @access  Private
export const getUserDevices = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log(userId);
    const devices = await Device.find({ user: userId });
    console.log(devices)
    res.json(devices);
});
