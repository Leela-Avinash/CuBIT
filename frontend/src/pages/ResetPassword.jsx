import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { email, newPassword }
      );
      setMessage(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response.data.message || "Error occurred");
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
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition duration-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition duration-300"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gray-600 hover:bg-gray-500 text-gray-100 font-semibold rounded-lg shadow-md transition duration-300"
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
