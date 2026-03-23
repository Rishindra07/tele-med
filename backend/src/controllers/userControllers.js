const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const EmailOTP = require("../models/EmailOTP.js");
const PendingRegistration = require("../models/PendingRegistration.js");
const RefreshToken = require("../models/RefreshToken.js");
const { sendEmail } = require("../services/notificationService.js");
const {
  createAccessToken,
  issueAuthTokens,
  getRefreshSecret
} = require("../utils/tokenUtils.js");

const REGISTRATION_ROLES = ["patient", "doctor", "pharmacist", "admin"];

const normalizeEmail = (email) => (email ? email.trim().toLowerCase() : null);

const sanitizeUser = (user) => ({
  id: user._id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  email_verified: user.email_verified,
  is_active: user.is_active,
  is_approved: user.is_approved
});

const sendVerificationOtpEmail = async (email, fullName) => {
  const otp = await EmailOTP.createOTP(email, "email_verification");
  const emailResult = await sendEmail({
    to: email,
    subject: "Verify your Seva Telehealth account",
    text: `Hi ${fullName}, your Seva Telehealth verification OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Hi ${fullName},</p><p>Your Seva Telehealth verification OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
  });

  return emailResult;
};

const registerUser = async (req, res) => {
  try {
    const { name, full_name, email, password, role } = req.body;

    const resolvedName = (full_name || name || "").trim();
    const normalizedEmail = normalizeEmail(email);

    if (!resolvedName || !normalizedEmail || !password || !role) {
      return res.status(400).json({ message: "Full name, email, password, and role are required" });
    }

    if (!REGISTRATION_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    await PendingRegistration.deleteMany({ email: normalizedEmail });

    const pendingRegistration = await PendingRegistration.create({
      full_name: resolvedName,
      email: normalizedEmail,
      password_hash: password,
      role,
      expires_at: new Date(Date.now() + 15 * 60 * 1000)
    });

    const emailResult = await sendVerificationOtpEmail(normalizedEmail, resolvedName);

    return res.status(201).json({
      success: true,
      message: emailResult.ok
        ? `${role} registration started. Verify your email OTP to complete account creation.`
        : `${role} registration started. OTP was created, but email delivery is not configured yet.`,
      email_delivery: emailResult.ok ? "sent" : "pending",
      pending_registration: {
        email: pendingRegistration.email,
        role: pendingRegistration.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const pendingRegistration = await PendingRegistration.findOne({ email: normalizedEmail });
    const user = pendingRegistration ? null : await User.findOne({ email: normalizedEmail });

    if (!pendingRegistration && !user) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetEmail = pendingRegistration ? pendingRegistration.email : user.email;
    const targetName = pendingRegistration ? pendingRegistration.full_name : user.full_name;
    const emailResult = await sendVerificationOtpEmail(targetEmail, targetName);

    return res.json({
      success: true,
      message: emailResult.ok ? "OTP sent successfully" : "OTP created, but email delivery is not configured yet.",
      email_delivery: emailResult.ok ? "sent" : "pending"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { otp } = req.body;

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    await EmailOTP.verifyOTP(normalizedEmail, otp, "email_verification");

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const pendingRegistration = await PendingRegistration.findOne({ email: normalizedEmail }).select("+password_hash");

      if (!pendingRegistration) {
        return res.status(404).json({ message: "Registration not found or expired. Please register again." });
      }

      const duplicateUser = await User.findOne({ email: pendingRegistration.email });
      if (duplicateUser) {
        await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
        return res.status(400).json({ message: "Account already exists. Please log in instead." });
      }

      user = await User.create({
        full_name: pendingRegistration.full_name,
        email: pendingRegistration.email,
        password_hash: pendingRegistration.password_hash,
        role: pendingRegistration.role,
        email_verified: true,
        email_verified_at: new Date(),
        is_approved: ["patient", "admin"].includes(pendingRegistration.role)
      });

      await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
    } else {
      user.email_verified = true;
      user.email_verified_at = new Date();
      await user.save();
    }

    const tokens = await issueAuthTokens(user, req);

    return res.json({
      success: true,
      message: ["doctor", "pharmacist"].includes(user.role) && !user.is_approved
        ? "Email verified successfully. Complete your profile and wait for admin approval."
        : "Email verified successfully",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      const pendingRegistration = await PendingRegistration.findOne({ email: normalizedEmail }).select("+password_hash");

      if (!pendingRegistration) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const pendingPasswordMatch = await pendingRegistration.comparePassword(password);
      if (!pendingPasswordMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const emailResult = await sendVerificationOtpEmail(
        pendingRegistration.email,
        pendingRegistration.full_name
      );

      return res.status(403).json({
        verification_email: pendingRegistration.email,
        message: emailResult.ok
          ? "Please verify your email first. A fresh OTP has been sent."
          : "Please verify your email first. A fresh OTP was created but email delivery is not configured yet."
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    if (!user.email_verified) {
      const emailResult = await sendVerificationOtpEmail(user.email, user.full_name);
      return res.status(403).json({
        verification_email: user.email,
        message: emailResult.ok
          ? "Please verify your email first. A fresh OTP has been sent."
          : "Please verify your email first. A fresh OTP was created but email delivery is not configured yet."
      });
    }

    if (["doctor", "pharmacist"].includes(user.role) && !user.is_approved) {
      return res.status(403).json({ message: "Complete your profile and wait for admin approval." });
    }

    user.last_login_at = new Date();
    user.last_login_ip = req.ip || req.socket?.remoteAddress || null;
    await user.save();

    const tokens = await issueAuthTokens(user, req);

    return res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const storedToken = await RefreshToken.findValid(refreshToken);
    if (!storedToken) {
      return res.status(401).json({ message: "Refresh token is invalid or expired" });
    }

    const decoded = jwt.verify(refreshToken, getRefreshSecret());
    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token type" });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      await RefreshToken.revokeOne(refreshToken);
      return res.status(401).json({ message: "User no longer has access" });
    }

    await RefreshToken.revokeOne(refreshToken);
    const newTokens = await issueAuthTokens(user, req);

    return res.json({
      success: true,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken
    });
  } catch (error) {
    return res.status(401).json({ message: "Refresh token invalid or expired" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    await RefreshToken.revokeOne(refreshToken);
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logoutAllSessions = async (req, res) => {
  try {
    await RefreshToken.revokeAll(req.user._id);
    return res.json({ success: true, message: "All sessions logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  sendOtp,
  verifyOtp,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  createAccessToken
};
