const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware.js");
const { allowRoles } = require("../middleware/roleMiddleware.js");
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendTestEmail
} = require("../controllers/notificationController.js");

router.get("/my", protect, allowRoles("doctor", "patient", "pharmacist", "admin"), getMyNotifications);
router.post("/test-email", protect, allowRoles("doctor", "patient", "pharmacist", "admin"), sendTestEmail);
router.patch("/read-all", protect, allowRoles("doctor", "patient", "pharmacist", "admin"), markAllNotificationsRead);
router.patch("/:id/read", protect, allowRoles("doctor", "patient", "pharmacist", "admin"), markNotificationRead);

module.exports = router;
