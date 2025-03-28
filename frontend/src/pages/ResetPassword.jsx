import React, { useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
    // Extract token from the URL (e.g., /reset-password/:token)
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    // States to control password visibility
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const BACKEND_URL = import.meta.env.BACKEND_URL || "https://cubit.onrender.com";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/auth/reset-password`,
                { token, newPassword }
            );
            console.log(response)
            const data = response.data;
            console.log(data)
            setMessage(response.data.message);
            setError("");
            if (data.success) {
                navigate("/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error occurred");
            setMessage("");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-black px-4">
            <div className="w-full max-w-md bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-center text-gray-100 mb-6">
                    Reset Password
                </h2>
                {message && (
                    <p className="text-green-400 text-center mb-4">{message}</p>
                )}
                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password Field */}
                    <div className="relative">
                        <input
                            type={newPasswordVisible ? "text" : "password"}
                            placeholder="New Password"
                            className="w-full p-3 pr-10 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition duration-300"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <div
                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                            onClick={() =>
                                setNewPasswordVisible(!newPasswordVisible)
                            }
                        >
                            {newPasswordVisible ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </div>
                    </div>
                    {/* Confirm Password Field */}
                    <div className="relative">
                        <input
                            type={confirmPasswordVisible ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="w-full p-3 pr-10 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition duration-300"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <div
                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                            onClick={() =>
                                setConfirmPasswordVisible(
                                    !confirmPasswordVisible
                                )
                            }
                        >
                            {confirmPasswordVisible ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-gray-100 font-semibold rounded-lg shadow-md transition duration-300"
                    >
                        Reset Password
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link
                        to="/login"
                        className="text-gray-400 hover:text-gray-200 transition duration-300"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
