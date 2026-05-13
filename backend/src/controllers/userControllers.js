const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const Patient = require("../models/Patient.js");
const RefreshToken = require("../models/RefreshToken.js");
const GlobalSetting = require("../models/GlobalSetting.js");
const OtpVerification = require("../models/OtpVerfication.js");
const { sendEmail } = require("../services/notificationService.js");
const {
  createAccessToken,
  issueAuthTokens,
  getRefreshSecret
} = require("../utils/tokenUtils.js");

const REGISTRATION_ROLES = ["patient", "doctor", "pharmacist", "admin"];
const DEFAULT_GLOBAL_SETTINGS = {
  doctorVerification: true,
  openRegistration: true,
  newPharmacyEnrollment: true,
  twoFactor: false,
  autoBackup: true,
  globalLanguage: "en",
  minConsultationFee: 100,
  systemTimezone: "IST"
};

const normalizeEmail = (email) => (email ? email.trim().toLowerCase() : null);

const getGlobalSettings = async () => {
  const settingsList = await GlobalSetting.find({});
  return settingsList.reduce(
    (acc, setting) => ({
      ...acc,
      [setting.key]: setting.value
    }),
    { ...DEFAULT_GLOBAL_SETTINGS }
  );
};

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
    let createdUser = null;
    try {
      const { 
        name, full_name, email, password, role, 
        phone, specialization, medicalLicense,
        pharmacyName, ownerName, licenseNumber
      } = req.body;

      const resolvedName = (full_name || name || ownerName || pharmacyName || "").trim();
      const normalizedEmail = normalizeEmail(email);

      if (!resolvedName || !normalizedEmail || !password || !role) {
        return res.status(400).json({ message: "Required fields are missing" });
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password must be min 6 chars, 1 capital letter, 1 number, 1 special character" });
      }

      if (!REGISTRATION_ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role selected" });
      }

      const globalSettings = await getGlobalSettings();

      // Role-specific restrictions
      if (role === 'pharmacist') {
        if (globalSettings.newPharmacyEnrollment === false) {
          return res.status(403).json({ message: "Pharmacy enrollment is currently closed." });
        }
      }

      if (role === 'patient') {
        if (globalSettings.openRegistration === false) {
          return res.status(403).json({ message: "Public registration is currently restricted." });
        }
      }

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create User
      createdUser = await User.create({
        full_name: resolvedName,
        email: normalizedEmail,
        phone: phone || null,
        password_hash: password,
        role,
        is_approved: ["doctor", "pharmacist"].includes(role) && globalSettings.doctorVerification === false
      });

      // Create Profile for Doctor or Pharmacist
      if (role === 'doctor') {
        const Doctor = require("../models/Doctor.js");
        await Doctor.create({
          user: createdUser._id,
          specialization: specialization || 'General Physician',
          medicalLicense: medicalLicense || `PENDING-${Date.now()}`,
          qualification: 'Pending Verification',
          hospitalName: 'Unassigned',
        });
      } else if (role === 'pharmacist') {
        const Pharmacy = require("../models/Pharmacy.js");
        await Pharmacy.create({
          user: createdUser._id,
          pharmacyName: pharmacyName || resolvedName,
          ownerName: ownerName || resolvedName,
          licenseNumber: licenseNumber || `PENDING-${Date.now()}`,
        });
      }

      const tokens = await issueAuthTokens(createdUser, req);

      // Send OTP for email verification
      try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000);
        
        // Ensure no stale records exist
        await OtpVerification.deleteMany({ email: normalizedEmail });
        
        await OtpVerification.create({ 
          email: normalizedEmail, 
          otp, 
          expiresAt 
        });
        
        await sendEmail({
          to: normalizedEmail,
          subject: "Verification Code - Seva TeleHealth",
          html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>Verify Your Email</h2><p>Your code: <b>${otp}</b></p></div>`
        });
      } catch (otpErr) {
        console.error("Auto-OTP failed:", otpErr);
      }

      return res.status(201).json({
        success: true,
        message: `${role} registration successful. Please verify your email.`,
        needsVerification: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: sanitizeUser(createdUser)
      });
    } catch (error) {
      // Cleanup: If user was created but profile failed, delete the user
      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id).catch(err => console.error("Cleanup failed:", err));
      }

      console.error("Registration error:", error);
      
      // Handle duplicate key error (Mongo E11000)
      if (error.code === 11000) {
        if (error.keyPattern?.medicalLicense) {
          return res.status(400).json({ message: "This medical license is already registered with another doctor." });
        }
        if (error.keyPattern?.email) {
          return res.status(400).json({ message: "Email already registered" });
        }
        if (error.keyPattern?.licenseNumber) {
            return res.status(400).json({ message: "This pharmacy license number is already registered." });
        }
        return res.status(400).json({ message: "A record with this information already exists." });
      }

      return res.status(500).json({ message: error.message || "Registration failed" });
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

    if (user.is_email_verified === false) {
      return res.status(403).json({ 
        message: "Email not verified. Please verify your email first.",
        needsVerification: true 
      });
    }

    if (["doctor", "pharmacist"].includes(user.role) && !user.is_approved) {
      const globalSettings = await getGlobalSettings();

      if (globalSettings.doctorVerification !== false) {
        return res.status(403).json({ message: "Complete your profile and wait for admin approval." });
      }

      user.is_approved = true;
      user.approved_at = new Date();
      await user.save();
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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: "Password must be min 6 chars, 1 capital letter, 1 number, 1 special character" });
    }

    const user = await User.findById(req.user._id).select("+password_hash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    user.password_hash = newPassword;
    await user.save();

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);
    
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    console.log(`[OTP_SEND] Generated OTP ${otp} for ${normalizedEmail}`);

    // Ensure no stale records exist
    await OtpVerification.deleteMany({ email: normalizedEmail });

    // Store NEW OTP
    await OtpVerification.create({ 
      email: normalizedEmail, 
      otp, 
      expiresAt 
    });

    // Send Email
    await sendEmail({
      to: normalizedEmail,
      subject: "Verification Code - Seva TeleHealth",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #2563EB; text-align: center;">Verify Your Email</h2>
          <p>Hello,</p>
          <p>Your verification code for Seva TeleHealth is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563EB; background: #f0f4ff; padding: 10px 20px; border-radius: 5px;">${otp}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.8em; color: #777; text-align: center;">Seva TeleHealth Team</p>
        </div>
      `
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const cleanOtp = String(otp || "").trim();

    console.log(`[OTP_VERIFY] Searching for: ${normalizedEmail} with OTP: "${cleanOtp}"`);
    
    if (!normalizedEmail || !cleanOtp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Explicitly search by email first
    const otpRecord = await OtpVerification.findOne({ email: normalizedEmail }).sort({ expiresAt: -1 });

    if (!otpRecord) {
      console.log(`[OTP_VERIFY] NO RECORD found for email: ${normalizedEmail}`);
      return res.status(400).json({ message: "No verification code found for this email.", debug: "NO_RECORD" });
    }

    console.log(`[OTP_VERIFY] Found record for ${normalizedEmail}. Database OTP: "${otpRecord.otp}", Input OTP: "${cleanOtp}"`);

    if (otpRecord.otp !== cleanOtp) {
      console.log(`[OTP_VERIFY] MISMATCH for ${normalizedEmail}`);
      return res.status(400).json({ message: "Invalid code. Please check your email.", debug: "MISMATCH", dbValue: otpRecord.otp, inValue: cleanOtp });
    }

    if (otpRecord.expiresAt < new Date()) {
      console.log(`[OTP_VERIFY] OTP expired for ${normalizedEmail}`);
      return res.status(400).json({ message: "OTP has expired. Please request a new one.", debug: "EXPIRED" });
    }

    // Mark user as verified if they exist
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      user.is_email_verified = true;
      await user.save();
    }

    // Delete OTP after successful verification
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Verification failed" });
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
  changePassword,
  deactivateUserAccount,
  deleteUserMedicalData,
  deleteUserAccount,
  createAccessToken,
  sendOtp,
  verifyOtp
};
