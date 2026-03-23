const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware.js");
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions
} = require("../controllers/userControllers.js");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/logout-all", protect, logoutAllSessions);

module.exports = router;
