const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware.js");
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  sendOtp,
  verifyOtp
} = require("../controllers/userControllers.js");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/logout-all", protect, logoutAllSessions);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
