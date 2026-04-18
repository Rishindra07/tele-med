const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const Patient = require("../models/Patient.js");
const RefreshToken = require("../models/RefreshToken.js");
const GlobalSetting = require("../models/GlobalSetting.js");
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
  profile_image: user.profile_image,
  settings: user.settings || {}
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

    if (role === 'pharmacist') {
      const pharmEnrollSetting = await GlobalSetting.findOne({ key: 'newPharmacyEnrollment' });
      if (pharmEnrollSetting && pharmEnrollSetting.value === false) {
        return res.status(403).json({ message: "Pharmacy enrollment is currently closed by administration." });
      }
    }

    if (role === 'patient') {
      const openRegSetting = await GlobalSetting.findOne({ key: 'openRegistration' });
      if (openRegSetting && openRegSetting.value === false) {
        return res.status(403).json({ message: "Public patient registration is currently restricted. Please contact our support team for a referral." });
      }
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

    // Reactivate account if it was deactivated
    if (!user.is_active) {
      user.is_active = true;
      user.reactivated_at = new Date();
    }

    if (["doctor", "pharmacist"].includes(user.role) && !user.is_approved) {
      const docVerifySetting = await GlobalSetting.findOne({ key: 'doctorVerification' });
      const isMandatory = docVerifySetting ? docVerifySetting.value !== false : true;
      
      if (isMandatory) {
        return res.status(403).json({ message: "Complete your profile and wait for admin approval." });
      } else {
        // Auto-approve if verification is not mandatory
        user.is_approved = true;
        user.approved_at = new Date();
        await user.save();
      }
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

const getPatientProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let profile = await Patient.findOne({ user: req.user._id });
    if (!profile) {
      profile = await Patient.create({ user: req.user._id, settings: {} });
    }

    const Consultation = require("../models/Consultation.js");
    const Prescription = require("../models/Prescription.js");
    const HealthRecord = require("../models/HealthRecord.js");

    const counts = {
      consultations: await Consultation.countDocuments({ patient: req.user._id }),
      prescriptions: await Prescription.countDocuments({ patient: req.user._id }),
      records: await HealthRecord.countDocuments({ patient: req.user._id })
    };

    return res.json({
      success: true,
      user: sanitizeUser(user),
      profile,
      counts
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePatientProfile = async (req, res, next) => {
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
      emergencyContactPhone,
      location
    } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.full_name = name;
    
    if (phone) {
      let formattedPhone = phone.trim().replace(/\s+/g, '');
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.length === 10) {
          formattedPhone = `+91${formattedPhone}`;
        } else if (formattedPhone.length === 12 && formattedPhone.startsWith('91')) {
          formattedPhone = `+${formattedPhone}`;
        }
      }
      user.phone = formattedPhone;
    }

    if (email) user.email = email.toLowerCase().trim();
    if (profile_image !== undefined) user.profile_image = profile_image;
    
    await user.save();

    let profile = await Patient.findOne({ user: req.user._id });
    if (!profile) {
      profile = new Patient({ user: req.user._id, settings: {} });
    }
    
    if (dob !== undefined) profile.dob = dob;
    if (age !== undefined) profile.age = age ? Number(age) : null;
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

    if (location !== undefined) {
      profile.location = {
        lat: location?.lat || null,
        lng: location?.lng || null
      };
    }

    await profile.save();

    const Consultation = require("../models/Consultation.js");
    const Prescription = require("../models/Prescription.js");
    const HealthRecord = require("../models/HealthRecord.js");

    const counts = {
      consultations: await Consultation.countDocuments({ patient: req.user._id }),
      prescriptions: await Prescription.countDocuments({ patient: req.user._id }),
      records: await HealthRecord.countDocuments({ patient: req.user._id })
    };

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(user),
      profile,
      counts
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const updatePatientSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    // Save to user model (universal)
    const user = await User.findById(req.user._id);
    if (user) {
      user.settings = settings || {};
      user.markModified('settings');
      await user.save();
    }

    // Still save to patient profile for backward compatibility
    let profile = await Patient.findOne({ user: req.user._id });
    if (profile) {
      profile.settings = settings || {};
      profile.markModified('settings');
      await profile.save();
    }

    return res.json({
      success: true,
      message: "Settings updated successfully",
      settings: settings || {}
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.settings = settings || {};
    user.markModified('settings');
    await user.save();

    return res.json({
      success: true,
      message: "Settings updated successfully",
      settings: user.settings
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deactivateUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.is_active = false;
    user.deactivated_at = new Date();
    user.deactivation_reason = (req.body && req.body.reason) || "Self-deactivated via settings";
    await user.save();

    try {
        await RefreshToken.revokeAll(req.user._id);
    } catch (tokenErr) {
        // Continue anyway, account is already inactive
    }

    return res.json({ success: true, message: "Account deactivated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUserMedicalData = async (req, res) => {
  try {
    const Consultation = require("../models/Consultation.js");
    const Prescription = require("../models/Prescription.js");
    const HealthRecord = require("../models/HealthRecord.js");

    await Promise.all([
      Consultation.deleteMany({ patient: req.user._id }),
      Prescription.deleteMany({ patient: req.user._id }),
      HealthRecord.deleteMany({ patient: req.user._id })
    ]);

    return res.json({ success: true, message: "Medical data deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete associated patient profile
    const Patient = require("../models/Patient.js");
    await Patient.deleteOne({ user: req.user._id });

    // Delete the user
    await User.findByIdAndDelete(req.user._id);
    
    // Revoke all tokens
    await RefreshToken.revokeAll(req.user._id);

    return res.json({ success: true, message: "Account deleted permanently" });
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
  updateUserSettings,
  deactivateUserAccount,
  deleteUserMedicalData,
  deleteUserAccount,
  createAccessToken
};
