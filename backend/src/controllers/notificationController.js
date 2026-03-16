const Notification = require("../models/Notification.js");
const {
  sendEmail,
  verifyEmailTransporter
} = require("../services/notificationService.js");

const parseLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return 20;
  return Math.min(parsed, 100);
};

exports.getMyNotifications = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit),
      Notification.countDocuments({ user: req.user._id, read: false })
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

exports.sendTestEmail = async (req, res) => {
  try {
    const verification = await verifyEmailTransporter();
    if (!verification.ok) {
      return res.status(400).json({
        success: false,
        message: "SMTP verification failed",
        reason: verification.reason
      });
    }

    const recipient = req.body?.to || req.user.email;
    const result = await sendEmail({
      to: recipient,
      subject: "Seva TeleHealth SMTP Test",
      text: `SMTP test email sent at ${new Date().toISOString()}`
    });

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: "Email send failed",
        reason: result.reason
      });
    }

    res.json({
      success: true,
      message: "Test email sent",
      recipient,
      messageId: result.messageId
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send test email" });
  }
};
