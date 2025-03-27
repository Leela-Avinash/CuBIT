import mongoose from "mongoose";

const locationHistorySchema = new mongoose.Schema(
    {
        device: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        batteryVoltage: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const LocationHistory = mongoose.model(
    "LocationHistory",
    locationHistorySchema
);
export default LocationHistory;
