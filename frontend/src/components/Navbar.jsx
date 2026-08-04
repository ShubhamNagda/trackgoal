import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.svg"

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500 text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-2 py-2">
        <img
         src={logo}
         alt="TrackGoal"
         className=" w-52 "
        />
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm">Hi, {user?.name}</span>
          <button
            onClick={logout}
            className="bg-white text-primary-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
