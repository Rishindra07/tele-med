const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const Patient = require("../models/Patient.js");
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
  is_active: user.is_active,
  is_approved: user.is_approved,
  profile_image: user.profile_image
});

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

    const user = await User.create({
      full_name: resolvedName,
      email: normalizedEmail,
      password_hash: password,
      role
    });

    const tokens = await issueAuthTokens(user, req);

    return res.status(201).json({
      success: true,
      message: `${role} registration successful.`,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Account is inactive" });
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

const getPatientProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let profile = await Patient.findOne({ user: req.user._id });
    if (!profile) {
      profile = await Patient.create({ user: req.user._id, settings: {} });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user),
      profile
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      dob,
      age,
      gender,
      bloodGroup,
      address,
      profile_image,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone
    } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.full_name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (profile_image !== undefined) user.profile_image = profile_image;
    
    await user.save();

    let profile = await Patient.findOne({ user: req.user._id });
    if (!profile) {
      profile = new Patient({ user: req.user._id, settings: {} });
    }
    
    if (dob !== undefined) profile.dob = dob;
    if (age !== undefined) profile.age = age;
    if (gender !== undefined) profile.gender = gender;
    if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
    if (address !== undefined) profile.address = address;

    if (emergencyContactName !== undefined || emergencyContactRelation !== undefined || emergencyContactPhone !== undefined) {
      profile.emergency_contact = {
        name: emergencyContactName !== undefined ? emergencyContactName : profile.emergency_contact?.name || null,
        relation: emergencyContactRelation !== undefined ? emergencyContactRelation : profile.emergency_contact?.relation || null,
        phone: emergencyContactPhone !== undefined ? emergencyContactPhone : profile.emergency_contact?.phone || null
      };
    }

    await profile.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(user),
      profile
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePatientSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    let profile = await Patient.findOne({ user: req.user._id });
    if (!profile) {
      profile = new Patient({ user: req.user._id, settings: {} });
    }
    
    profile.settings = settings || {};
    profile.markModified('settings');
    await profile.save();

    return res.json({
      success: true,
      message: "Settings updated successfully",
      settings: profile.settings
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  getPatientProfile,
  updatePatientProfile,
  updatePatientSettings,
  createAccessToken
};
