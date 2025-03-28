import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDevice } from "../store/slices/deviceSlice";
import { useNavigate } from "react-router-dom";

const AddDevice = () => {
  const [formData, setFormData] = useState({
    deviceId: "",
    activationKey: "",
    deviceName: "",
  });
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.device);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(addDevice(formData));
    if (addDevice.fulfilled.match(resultAction)) {
      navigate("/devices");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 via-gray-900 to-black p-4">
      <div className="w-full max-w-md bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-lg shadow-lg p-8 border border-gray-700 border-opacity-50">
        <h2 className="text-3xl font-bold text-gray-100 text-center mb-6">
          Add Device
        </h2>
        {error && (
          <p className="text-gray-400 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="deviceId"
            placeholder="Device ID"
            className="w-full p-3 rounded-lg bg-transparent border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition duration-300"
            value={formData.deviceId}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="activationKey"
            placeholder="Activation Key"
            className="w-full p-3 rounded-lg bg-transparent border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition duration-300"
            value={formData.activationKey}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="deviceName"
            placeholder="Device Name (optional)"
            className="w-full p-3 rounded-lg bg-transparent border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition duration-300"
            value={formData.deviceName}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full py-3 bg-purple-700 rounded-lg text-gray-100 font-semibold hover:bg-purple-600 transition duration-300 shadow-lg"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Device"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDevice;
