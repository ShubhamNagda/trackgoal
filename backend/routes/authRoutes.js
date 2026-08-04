import express from "express";
import {
  registerUser,
  verifyRegistrationOtp,
  loginWithPassword,
  requestLoginOtp,
  loginWithOtp,
  resendOtp,
  getMe,
} from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-registration-otp", verifyRegistrationOtp);
router.post("/login", loginWithPassword);
router.post("/request-login-otp", requestLoginOtp);
router.post("/login-otp", loginWithOtp);
router.post("/resend-otp", resendOtp);
router.get("/me", protect, getMe);

export default router;
