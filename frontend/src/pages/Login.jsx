import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import OtpLogin from "../components/OtpLogin.jsx";

const Login = () => {
  const [mode, setMode] = useState("password"); // "password" | "otp"
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-primary-700 mb-1">🎯 TrackGoal</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Welcome back, login to continue</p>

        <div className="flex mb-6 bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setMode("password")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
              mode === "password" ? "bg-white shadow text-primary-700" : "text-gray-500"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setMode("otp")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
              mode === "otp" ? "bg-white shadow text-primary-700" : "text-gray-500"
            }`}
          >
            OTP
          </button>
        </div>

        {mode === "password" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          </form>
        ) : (
          <OtpLogin />
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
