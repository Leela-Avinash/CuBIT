import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentDevice, fetchDevices } from "../store/slices/deviceSlice";
import { useNavigate } from "react-router-dom";

const DeviceList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { devices, loading, error, trackedDevice } = useSelector(
        (state) => state.device
    );

    useEffect(() => {
        dispatch(fetchDevices());
    }, [dispatch]);

    const handleNavigate = (device, path) => {
        dispatch(setCurrentDevice(device));
        navigate(path);
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
                                <div
                                    key={device._id}
                                    onClick={() =>
                                        handleNavigate(device, `/device/${device._id}`)
                                    }
                                    className="cursor-pointer transform transition duration-300 hover:scale-105"
                                >
                                    <div className="bg-gray-800 bg-opacity-80 rounded-xl shadow-lg p-6 hover:bg-opacity-90 transition-colors">
                                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                                            {displayName}
                                            {isTracked && (
                                                <span className="text-sm font-medium text-green-400">
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

                                        <div className="flex space-x-2 mt-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNavigate(device, `/device/${device._id}`);
                                                }}
                                                className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-600 transition-colors"
                                            >
                                                Location
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNavigate(
                                                        device,
                                                        `/device/${device._id}/history`
                                                    );
                                                }}
                                                className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-600 transition-colors"
                                            >
                                                History
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
