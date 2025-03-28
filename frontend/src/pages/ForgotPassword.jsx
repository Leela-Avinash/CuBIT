import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:5000";
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Disable the button immediately to prevent multiple clicks
    if (isSent) return;
    setIsSent(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/forgot-password`,
        { email }
      );
      setMessage(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error occurred");
      setMessage("");
      // Re-enable the button if there's an error
      setIsSent(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-black px-4">
      <div className="w-full max-w-md bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-100 mb-6">
          Forgot Password
        </h2>
        {message && (
          <p className="text-green-400 text-center mb-4">{message}</p>
        )}
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition duration-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isSent}
            className={`w-full py-3 ${
              isSent ? "bg-green-600" : "bg-purple-600 hover:bg-purple-500"
            } text-gray-100 font-semibold rounded-lg shadow-md transition duration-300`}
          >
            {isSent ? "Email Sent" : "Send Reset Email"}
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

export default ForgotPassword;
