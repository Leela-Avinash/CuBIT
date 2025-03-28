import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentDevice, fetchDevices } from "../store/slices/deviceSlice";
import { Link } from "react-router-dom";

const DeviceList = () => {
    const dispatch = useDispatch();
    const { devices, loading, error, trackedDevice } = useSelector(
        (state) => state.device
    );

    useEffect(() => {
        dispatch(fetchDevices());
    }, [dispatch]);

    const handleDeviceClick = (device) => {
        dispatch(setCurrentDevice(device));
        console.log("Device clicked:", device);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex flex-col items-center">
            <div className="w-full max-w-5xl">
                <h2 className="text-4xl font-extrabold text-white mb-8 text-center uppercase tracking-wide">
                    Your Devices
                </h2>
                {loading && <p className="text-white text-center">Loading devices...</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {devices && devices.length > 0 ? (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {devices.map((device) => {
                            const displayName =
                                device.deviceName ||
                                `Device${Math.floor(Math.random() * 1000)}`;
                            const isTracked =
                                trackedDevice && device._id === trackedDevice.device._id;
                            return (
                                <Link
                                    to={`/device/${device._id}`}
                                    onClick={() => handleDeviceClick(device)}
                                    key={device._id}
                                    className="transform transition duration-300 hover:scale-105"
                                >
                                    <div className="bg-gray-800 bg-opacity-80 rounded-xl shadow-xl p-6 hover:bg-gradient-to-br hover:from-gray-600 hover:to-black-800">
                                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                                            {displayName}
                                            {isTracked && (
                                                <span className="text-sm font-medium text-green-300">
                                                    (Active)
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-sm text-gray-300 mb-2">
                                            Device ID: {device.deviceId}
                                        </p>
                                        {device.lastLocation && (
                                            <p className="text-gray-300">
                                                <span className="font-bold text-white">
                                                    Last Location:
                                                </span>{" "}
                                                {device.lastLocation.latitude},{" "}
                                                {device.lastLocation.longitude}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-white text-center mt-8">No devices found.</p>
                )}
            </div>
        </div>
    );
};

export default DeviceList;
