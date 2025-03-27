import LocationHistory from "../models/LocationHistory.js";
import Device from "../models/Device.js";
import asyncHandler from "express-async-handler";

// @desc    Get location history for a device
// @route   GET /api/location/history/:deviceId
// @access  Private
export const getLocationHistory = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;

    const history = await LocationHistory.find({ device: deviceId }).sort({
        date: 1,
    });

    res.json(history);
});

// @desc    Add a location record to history and update device’s lastLocation
// @route   POST /api/location/history/:deviceId
// @access  Private
export const addLocationRecord = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { latitude, longitude, batteryVoltage } = req.body;

    // Verify the device belongs to the user
    const device = await Device.findOne({ _id: deviceId, user: req.user._id });
    if (!device) {
        res.status(404);
        throw new Error("Device not found");
    }

    const locationRecord = await LocationHistory.create({
        device: deviceId,
        latitude,
        longitude,
        date: new Date(),
        time: new Date().toLocaleTimeString(),
        batteryVoltage,
    });

    // Update the device's last known location
    device.lastLocation = {
        latitude,
        longitude,
        date: locationRecord.date,
        time: locationRecord.time,
        batteryVoltage,
    };
    await device.save();

    res.status(201).json(locationRecord);
});
