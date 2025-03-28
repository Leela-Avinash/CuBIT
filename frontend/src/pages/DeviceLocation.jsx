import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateTrackedDeviceLocation } from "../store/slices/deviceSlice";
import MapComponent from "../components/MapComponent";
import io from "socket.io-client";

const BACKEND_URL = import.meta.env.BACKEND_URL || "https://cubit.onrender.com";
const socket = io(BACKEND_URL);

const DeviceLocation = () => {
    const { deviceId } = useParams();
    const dispatch = useDispatch();
    const { currentDevice, trackedDevice, loading, error } = useSelector(
        (state) => state.device
    );

    const [showInfo, setShowInfo] = useState(false);

    // Show/hide info from marker clicks or map clicks
    const handleMarkerClick = (shouldShow) => {
        setShowInfo(shouldShow);
    };

    // Socket listener
    useEffect(() => {
        const locationListener = (data) => {
            console.log("hello world");
            const { deviceId, lastLocation } = data;
            console.log("Received location update:", data);
            if (
                (trackedDevice && trackedDevice.device._id === deviceId) ||
                (currentDevice && currentDevice._id === deviceId)
            ) {
                dispatch(
                    updateTrackedDeviceLocation({
                        deviceId,
                        lastLocation,
                    })
                );
            }
        };

        socket.on("getDeviceLocation", locationListener);

        return () => {
            socket.off("getDeviceLocation", locationListener);
        };
    }, [dispatch, trackedDevice, currentDevice]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    const location = currentDevice?.lastLocation;

    return (
        <div className="relative h-screen w-full">
            {location ? (
                <>
                    {/* 
            Place the Map in a lower z-index layer 
            so overlays can appear above it.
          */}
                    <div className="absolute inset-0 z-0">
                        <MapComponent
                            latitude={location.latitude}
                            longitude={location.longitude}
                            onMarkerClick={handleMarkerClick}
                        />
                    </div>

                    {/* 
            DESKTOP OVERLAY (top-right)
            Hidden on mobile (below md)
            Use a higher z-index (e.g. z-10 or z-20) 
          */}
                    {/* DESKTOP OVERLAY (top-right) */}
                    <div
                        className="hidden md:block absolute top-4 right-4 z-20 
                bg-gray-800 text-white bg-opacity-95 
                p-4 rounded-lg shadow-lg w-64 
                overflow-hidden"
                    >
                        <h2 className="text-lg font-bold mb-2">Device Info</h2>
                        {/* If you want to display the device name */}
                        {currentDevice?.deviceName && (
                            <p className="mb-2">
                                <span className="font-semibold">Name:</span>{" "}
                                {currentDevice.deviceName}
                            </p>
                        )}
                        {location.date && (
                            <p className="mb-1">
                                <span className="font-semibold">Date:</span>{" "}
                                {new Date(location.date).toLocaleDateString()}
                            </p>
                        )}
                        {location.time && (
                            <p className="mb-1">
                                <span className="font-semibold">Time:</span>{" "}
                                {location.time}
                            </p>
                        )}
                        <p className="mb-1">
                            <span className="font-semibold">Latitude:</span>{" "}
                            {location.latitude}
                        </p>
                        <p className="mb-1">
                            <span className="font-semibold">Longitude:</span>{" "}
                            {location.longitude}
                        </p>
                        {location.batteryVoltage !== undefined && (
                            <p>
                                <span className="font-semibold">
                                    Battery Voltage:
                                </span>{" "}
                                {location.batteryVoltage}
                            </p>
                        )}
                    </div>

                    {/* MOBILE BOTTOM SHEET */}
                    <div
                        className={`md:hidden fixed bottom-0 left-0 right-0 z-20 
              bg-gray-800 text-white p-4 
              rounded-t-xl shadow-lg transition-transform duration-300 
              ${showInfo ? "translate-y-0" : "translate-y-full"} 
              overflow-hidden`}
                    >
                        <h2 className="text-lg font-bold mb-2">Device Info</h2>
                        {currentDevice?.deviceName && (
                            <p className="mb-2">
                                <span className="font-semibold">Name:</span>{" "}
                                {currentDevice.deviceName}
                            </p>
                        )}
                        {location.date && (
                            <p className="mb-1">
                                <span className="font-semibold">Date:</span>{" "}
                                {new Date(location.date).toLocaleDateString()}
                            </p>
                        )}
                        {location.time && (
                            <p className="mb-1">
                                <span className="font-semibold">Time:</span>{" "}
                                {location.time}
                            </p>
                        )}
                        <p className="mb-1">
                            <span className="font-semibold">Latitude:</span>{" "}
                            {location.latitude}
                        </p>
                        <p className="mb-1">
                            <span className="font-semibold">Longitude:</span>{" "}
                            {location.longitude}
                        </p>
                        {location.batteryVoltage !== undefined && (
                            <p>
                                <span className="font-semibold">
                                    Battery Voltage:
                                </span>{" "}
                                {location.batteryVoltage}
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    No location data available.
                </p>
            )}
        </div>
    );
};

export default DeviceLocation;
