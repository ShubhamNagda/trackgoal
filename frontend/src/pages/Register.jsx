import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const [step, setStep] = useState(1); // 1 = register form, 2 = verify otp
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-registration-otp", { email: form.email, otp });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-primary-700 mb-1">🎯 TrackGoal</h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          {step === 1 ? "Create your account" : "Verify your email"}
        </p>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
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
              minLength={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-500">
              We sent a 6-digit OTP to <span className="font-medium">{form.email}</span>
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        {error && <p className="text-xs text-red-600 mt-3 text-center">{error}</p>}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
