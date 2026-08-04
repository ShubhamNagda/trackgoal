import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtpEmail, generateOtp } from "../utils/sendEmail.js";

const OTP_EXPIRES_MIN = Number(process.env.OTP_EXPIRES_MIN || 5);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const otpExpiry = () => new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);

// @desc   Register a new user, send OTP for email verification
// @route  POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const otp = generateOtp();

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      otp: { code: otp, expiresAt: otpExpiry(), purpose: "register" },
    });

    await sendOtpEmail(email, otp, "register");

    res.status(201).json({
      message: "Registered successfully. OTP sent to your email for verification.",
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Verify OTP after registration
// @route  POST /api/auth/verify-registration-otp
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (
      !user.otp ||
      user.otp.purpose !== "register" ||
      user.otp.code !== otp ||
      user.otp.expiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Login with email + password
// @route  POST /api/auth/login
export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Request OTP to login (passwordless)
// @route  POST /api/auth/request-login-otp
export const requestLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "No account with this email" });
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const otp = generateOtp();
    user.otp = { code: otp, expiresAt: otpExpiry(), purpose: "login" };
    await user.save();

    await sendOtpEmail(email, otp, "login");

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Verify OTP and login
// @route  POST /api/auth/login-otp
export const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "No account with this email" });

    if (
      !user.otp ||
      user.otp.purpose !== "login" ||
      user.otp.code !== otp ||
      user.otp.expiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Resend OTP (register or login)
// @route  POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body; // purpose: "register" | "login"
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.otp = { code: otp, expiresAt: otpExpiry(), purpose: purpose || "login" };
    await user.save();

    await sendOtpEmail(email, otp, purpose);

    res.json({ message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get logged in user
// @route  GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user);
};
