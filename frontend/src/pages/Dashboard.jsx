import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black text-white">
            {/* Header */}
            <header className="py-4 bg-gray-800 border-b border-gray-700">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-extrabold text-center">
                        Device Tracker
                    </h1>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-gray-800 to-gray-900 py-16">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
                        {/* Left: Text */}
                        <div className="w-full md:w-1/2 mb-8 md:mb-0">
                            <h2 className="text-5xl font-bold mb-6">
                                Welcome to Device Tracker
                            </h2>
                            <p className="text-xl text-gray-300 mb-8">
                                Manage and track your devices in real time with
                                our cutting‑edge platform.
                            </p>
                            <div className="space-x-4">
                                <Link
                                    to="/add-device"
                                    className="inline-block bg-teal-700 hover:bg-teal-600 transition-colors duration-300 text-white py-3 px-8 rounded-lg shadow-lg"
                                >
                                    Add Device
                                </Link>
                                <Link
                                    to="/devices"
                                    className="inline-block bg-purple-700 hover:bg-purple-600 transition-colors duration-300 text-white py-3 px-8 rounded-lg shadow-lg"
                                >
                                    View Devices
                                </Link>
                            </div>
                        </div>

                        {/* Right: Image */}
                        <div className="w-full md:w-1/2 flex justify-center">
                            <img
                                src="./HeroSection.svg"
                                alt="Location Tracking Illustration"
                                className="max-w-full h-[450px] object-contain"
                            />
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="py-16 bg-gray-800">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <h3 className="text-4xl font-bold mb-6">
                                About Device Tracker
                            </h3>
                            <p className="text-lg text-gray-300 mb-8">
                                Device Tracker is a comprehensive solution for
                                monitoring your devices in real time. Our
                                platform leverages modern technologies to
                                provide accurate location tracking,
                                user-friendly management, and seamless
                                integration with your existing systems.
                            </p>
                            <p className="text-lg text-gray-300">
                                Whether you’re keeping track of company assets
                                or personal gadgets, Device Tracker delivers
                                reliable performance and a professional user
                                experience. Join us to experience next‑level
                                device management.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 py-6 border-t border-gray-700">
                <div className="container mx-auto px-4 text-center text-gray-400">
                    &copy; {new Date().getFullYear()} Device Tracker Inc. All
                    rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
