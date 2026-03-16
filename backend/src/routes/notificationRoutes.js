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

router.get("/my", protect, allowRoles("doctor", "patient"), getMyNotifications);
router.post("/test-email", protect, allowRoles("doctor", "patient"), sendTestEmail);
router.patch("/read-all", protect, allowRoles("doctor", "patient"), markAllNotificationsRead);
router.patch("/:id/read", protect, allowRoles("doctor", "patient"), markNotificationRead);

module.exports = router;
