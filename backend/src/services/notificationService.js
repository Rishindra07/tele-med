const Notification = require("../models/Notification.js");
let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch (error) {
  nodemailer = null;
}

let cachedTransporter = null;

const getEmailTransporter = () => {
  if (!nodemailer) return null;
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = String(process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  if (!host || !port || !user || !pass) return null;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000)
  });

  return cachedTransporter;
};

const verifyEmailTransporter = async () => {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    console.error("[EMAIL] verify failed", { error: error.message });
    return { ok: false, reason: error.message };
  }
};

const createNotification = async ({ userId, title, message, type = "system", data = {} }) => {
  if (!userId) return null;
  return Notification.create({
    user: userId,
    title,
    message,
    type,
    data
  });
};

const sendSms = async ({ to, message }) => {
  if (!to || !message) return { ok: false, reason: "missing-params" };

  // Placeholder for future SMS provider integration.
  console.log("[SMS]", { to, message });
  return { ok: true, channel: "placeholder" };
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    return { ok: false, reason: "missing-params" };
  }

  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log("[EMAIL] transporter not configured");
    return { ok: false, reason: "not-configured" };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });

    console.log("[EMAIL] sent", {
      to,
      subject,
      messageId: info.messageId
    });

    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL] send failed", {
      to,
      subject,
      error: error.message
    });
    return { ok: false, reason: error.message };
  }
};

const sendPush = async ({ userId, title, message, data = {} }) => {
  if (!userId || !title || !message) {
    return { ok: false, reason: "missing-params" };
  }

  // Current app surfaces these through the notification center until
  // a device push provider is plugged in.
  await createNotification({
    userId,
    title,
    message,
    data
  });

  return { ok: true, channel: "in-app" };
};

module.exports = {
  createNotification,
  sendEmail,
  sendSms,
  sendPush,
  verifyEmailTransporter
};
