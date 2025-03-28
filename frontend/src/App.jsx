import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AddDevice from "./pages/AddDevice";
import DeviceList from "./pages/DeviceList";
import DeviceLocation from "./pages/DeviceLocation";
import LocationHistory from "./pages/LocationHistory";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDispatch, useSelector } from "react-redux";

function App() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(
                    `${BACKEND_URL}/api/auth/check-auth`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                const json = await response.json();
                if (json.success) {
                    localStorage.setItem("user", JSON.stringify(json.user));
                    dispatch({ type: "auth/setAuth", payload: true });
                    dispatch({ type: "auth/setUser", payload: json.user });
                }
            } catch (err) {
                console.log("Error checking auth:", err);
            }
        };

        checkAuth();
    }, [dispatch]);
    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div>
                <Routes>
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                <Dashboard />
                            ) : (
                                <Navigate to={"/login"} />
                            )
                        }
                    />
                    <Route
                        path="/login"
                        // isAuthenticated ? <Navigate to={"/"} /> :
                        element={<Login />}
                    />
                    <Route
                        path="/signup"
                        element={
                            isAuthenticated ? <Navigate to={"/"} /> : <Signup />
                        }
                    />
                    <Route
                        path="/forgot-password"
                        element={
                            isAuthenticated ? (
                                <Navigate to={"/"} />
                            ) : (
                                <ForgotPassword />
                            )
                        }
                    />
                    <Route
                        path="/reset-password/:token"
                        element={
                            isAuthenticated ? (
                                <Navigate to={"/"} />
                            ) : (
                                <ResetPassword />
                            )
                        }
                    />
                    <Route
                        path="/add-device"
                        element={
                            isAuthenticated ? (
                                <AddDevice />
                            ) : (
                                <Navigate to={"/login"} />
                            )
                        }
                    />
                    <Route
                        path="/devices"
                        element={
                            isAuthenticated ? (
                                <DeviceList />
                            ) : (
                                <Navigate to={"/login"} />
                            )
                        }
                    />
                    <Route
                        path="/device/:deviceId"
                        element={
                            isAuthenticated ? (
                                <DeviceLocation />
                            ) : (
                                <Navigate to={"/login"} />
                            )
                        }
                    />
                    <Route
                        path="/device/:deviceId/history"
                        element={
                            isAuthenticated ? (
                                <LocationHistory />
                            ) : (
                                <LocationHistory />
                            )
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}

export default App;
