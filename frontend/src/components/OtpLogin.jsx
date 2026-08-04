import React, { useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const OtpLogin = () => {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter otp
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/request-login-otp", { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login-otp", { email, otp });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {step === 1 ? (
        <form onSubmit={requestOtp} className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <p className="text-sm text-gray-500">Enter the 6-digit OTP sent to {email}</p>
          <input
            type="text"
            placeholder="6-digit OTP"
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
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-xs text-gray-500 hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}
      {message && <p className="text-xs text-green-600">{message}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default OtpLogin;
