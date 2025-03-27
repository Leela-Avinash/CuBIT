import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-white hover:text-gray-300 transition-colors duration-300"
        >
          MERN App
        </Link>
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link
                to="/"
                className="text-white hover:text-gray-300 transition-colors duration-300"
              >
                Dashboard
              </Link>
              <Link
                to="/devices"
                className="text-white hover:text-gray-300 transition-colors duration-300"
              >
                Devices
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300 transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:text-gray-300 transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white hover:text-gray-300 transition-colors duration-300"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
