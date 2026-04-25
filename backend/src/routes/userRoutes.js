const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware.js");
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  getPatientProfile,
  updatePatientProfile,
  updatePatientSettings,
  updateUserSettings,
  changePassword,
  deactivateUserAccount,
  deleteUserMedicalData,
  deleteUserAccount
} = require("../controllers/userControllers.js");
// OTP verification endpoints are disabled for now.
// const { sendOtp, verifyOtp } = require("../controllers/userControllers.js");

router.post("/register", registerUser);
// router.post("/send-otp", sendOtp);
// router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/logout-all", protect, logoutAllSessions);

router.get("/patient/profile", protect, getPatientProfile);
router.put("/patient/profile", protect, updatePatientProfile);
router.put("/patient/settings", protect, updatePatientSettings);
router.put("/settings", protect, updateUserSettings);
router.put("/change-password", protect, changePassword);
router.post("/deactivate", protect, deactivateUserAccount);
router.delete("/medical-data", protect, deleteUserMedicalData);
router.delete("/", protect, deleteUserAccount);

module.exports = router;
