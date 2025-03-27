import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import io from "socket.io-client";

// Initialize trackedDevice from localStorage if available
const storedTrackedDevice = localStorage.getItem("trackedDevice")
    ? JSON.parse(localStorage.getItem("trackedDevice"))
    : null;

const initialState = {
    devices: [],
    currentDevice: null, // device data currently being watched
    trackedDevice: storedTrackedDevice, // tracks which device is being added/tracked
    loading: false,
    error: null,
};

const socket = io("http://localhost:5000");

export const addDevice = createAsyncThunk(
    "device/addDevice",
    async (deviceData, { getState, rejectWithValue }) => {
        // Check if a tracked device already exists
        // const state = getState().device;
        // if (state.trackedDevice) {
        //     return rejectWithValue("This device is already added");
        // }
        try {
            const response = await fetch(
                "http://localhost:5000/api/device/add",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(deviceData),
                }
            );
            const json = await response.json();
            console.log(json)
            if (!response.ok) {
                return rejectWithValue(json.message || "Failed to add device");
            }
            return json;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDevices = createAsyncThunk(
    "device/fetchDevices",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch("http://localhost:5000/api/device", {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const json = await response.json();
            if (!response.ok) {
                return rejectWithValue(
                    json.message || "Failed to fetch devices"
                );
            }
            return json; // assuming the backend returns an array of devices
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDeviceLocation = createAsyncThunk(
    "device/fetchDeviceLocation",
    async (deviceId, { rejectWithValue }) => {
        try {
            const response = await new Promise((resolve, reject) => {
                socket.emit("getDeviceLocation", { deviceId }, (res) => {
                    if (res.error) {
                        reject(new Error(res.error));
                    } else {
                        resolve(res);
                    }
                });
            });
            return response; // Expected structure: { deviceId, lastLocation }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchLocationHistory = createAsyncThunk(
    "device/fetchLocationHistory",
    async (deviceId, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/location/history/${deviceId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );
            const json = await response.json();
            if (!response.ok) {
                return rejectWithValue(
                    json.message || "Failed to fetch location history"
                );
            }
            return json;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * This function handles polling for location updates using the browser's
 * geolocation API. It emits the updated location to the backend every 2 seconds
 * via socket.io and listens for the "locationUpdated" event.
 */
export const startLocationUpdates = () => (dispatch, getState) => {
    const { trackedDevice } = getState().device;

    if (trackedDevice && trackedDevice.device) {
        // Start fetching new location data every 2 seconds
        setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    let { latitude, longitude } = position.coords;
                    latitude = latitude + Math.random() * 0.40004;
                    longitude = longitude + Math.random() * 0.40004;
                    const now = new Date();
                    const date = now.toLocaleDateString();
                    const time = now.toLocaleTimeString();

                    // Attempt to get battery info if available
                    let batteryVoltage = null;
                    if (navigator.getBattery) {
                        try {
                            const battery = await navigator.getBattery();
                            batteryVoltage = battery.level * 100;
                        } catch (err) {
                            console.error("Battery info not available:", err);
                        }
                    }

                    // Emit the new location data to the backend via socket.io.
                    socket.emit("updateLocation", {
                        deviceId: trackedDevice.device._id,
                        latitude,
                        longitude,
                        date,
                        time,
                        batteryVoltage,
                    });
                },
                (error) => {
                    console.error("Error fetching location:", error);
                },
                { enableHighAccuracy: true, maximumAge: 0 }
            );
        }, 2000);
    }

    // Listen for the location update from the backend
    socket.on("locationUpdated", (data) => {
        const { deviceId, lastLocation } = data;
        const { trackedDevice } = getState().device;

        if (trackedDevice && trackedDevice.device._id === deviceId) {
            // Create a new trackedDevice object with updated lastLocation
            const updatedTrackedDevice = {
                ...trackedDevice,
                device: {
                    ...trackedDevice.device,
                    lastLocation,
                },
            };
            // Update the Redux state and local storage with the new tracked device info
            dispatch(setTrackedDevice(updatedTrackedDevice));
        }
    });
};

/**
 * New polling function to fetch the list of devices every 2 seconds.
 * This moves the polling logic into the deviceSlice instead of in a React component.
 */
export const startDevicesPolling = () => (dispatch) => {
    setInterval(() => {
        dispatch(fetchDevices());
    }, 2000);
};

const deviceSlice = createSlice({
    name: "device",
    initialState,
    reducers: {
        setCurrentDevice(state, action) {
            state.currentDevice = action.payload;
        },
        setTrackedDevice(state, action) {
            state.trackedDevice = action.payload;
            // Update local storage with the new tracked device
            localStorage.setItem(
                "trackedDevice",
                JSON.stringify(action.payload)
            );
        },
        updateTrackedDeviceLocation(state, action) {
            const { deviceId, lastLocation } = action.payload;
            // Check if the tracked device matches the deviceId we received
            if (
                state.trackedDevice &&
                state.trackedDevice.device &&
                state.trackedDevice.device._id === deviceId
            ) {
                state.trackedDevice.device.lastLocation = lastLocation;
            }
            if (state.currentDevice && state.currentDevice._id === deviceId) {
                state.currentDevice.lastLocation = lastLocation;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // addDevice
            .addCase(addDevice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addDevice.fulfilled, (state, action) => {
                state.loading = false;
                state.devices.push(action.payload);
                state.trackedDevice = action.payload;
                // Store the newly added device in local storage
                localStorage.setItem(
                    "trackedDevice",
                    JSON.stringify(action.payload)
                );
            })
            .addCase(addDevice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetchDevices
            .addCase(fetchDevices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDevices.fulfilled, (state, action) => {
                state.loading = false;
                state.devices = action.payload;
            })
            .addCase(fetchDevices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetchDeviceLocation
            .addCase(fetchDeviceLocation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeviceLocation.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDevice = {
                    ...state.currentDevice,
                    lastLocation: action.payload,
                };
            })
            .addCase(fetchDeviceLocation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetchLocationHistory
            .addCase(fetchLocationHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLocationHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDevice = {
                    ...state.currentDevice,
                    locationHistory: action.payload,
                };
            })
            .addCase(fetchLocationHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setCurrentDevice,
    setTrackedDevice,
    updateTrackedDeviceLocation,
} = deviceSlice.actions;
export default deviceSlice.reducer;
