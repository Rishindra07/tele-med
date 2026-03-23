const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const emailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    otp_hash: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      required: true,
      enum: ["email_verification", "password_reset", "login_otp"]
    },
    expires_at: {
      type: Date,
      required: true
    },
    is_used: {
      type: Boolean,
      default: false
    },
    attempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

emailOtpSchema.index({ email: 1, purpose: 1 });
emailOtpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

emailOtpSchema.statics.createOTP = async function createOTP(email, purpose) {
  const normalizedEmail = email.toLowerCase().trim();
  await this.deleteMany({ email: normalizedEmail, purpose, is_used: false });

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otp_hash = await bcrypt.hash(otp, 10);

  await this.create({
    email: normalizedEmail,
    otp_hash,
    purpose,
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
    is_used: false,
    attempts: 0
  });

  return otp;
};

emailOtpSchema.statics.verifyOTP = async function verifyOTP(email, submittedOtp, purpose) {
  const normalizedEmail = email.toLowerCase().trim();
  const record = await this.findOne({
    email: normalizedEmail,
    purpose,
    is_used: false,
    expires_at: { $gt: new Date() }
  });

  if (!record) {
    throw new Error("OTP expired or not found. Please request a new OTP.");
  }

  if (record.attempts >= 5) {
    await record.deleteOne();
    throw new Error("Too many wrong attempts. Please request a new OTP.");
  }

  const isMatch = await bcrypt.compare(submittedOtp, record.otp_hash);

  if (!isMatch) {
    await this.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    throw new Error(`Wrong OTP. ${Math.max(0, 4 - record.attempts)} attempts remaining.`);
  }

  await this.updateOne({ _id: record._id }, { is_used: true });
  return true;
};

module.exports = mongoose.model("EmailOTP", emailOtpSchema);
