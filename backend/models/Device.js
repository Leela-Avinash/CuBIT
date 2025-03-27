import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
    {
        deviceId: {
            type: String,
            required: true,
            unique: true,
        },
        deviceName: {
            type: String,
            required: false,
        },
        activationKey: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        lastLocation: {
            latitude: Number,
            longitude: Number,
            date: Date,
            time: String,
            batteryVoltage: Number,
        },
    },
    { timestamps: true }
);

const Device = mongoose.model("Device", deviceSchema);
export default Device;
