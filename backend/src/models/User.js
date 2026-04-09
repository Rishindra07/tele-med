const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    phone: {
      type: String,
      default: null,
      trim: true,
      match: [/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number with +91"]
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["patient", "doctor", "pharmacist", "admin"],
        message: "Role must be patient, doctor, pharmacist, or admin"
      }
    },
    password_hash: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"]
    },
    // Verification fields removed
    preferred_language: {
      type: String,
      default: "EN",
      enum: ["EN", "HI", "PA", "TA", "TE", "BN", "MR", "GU", "KN"]
    },
    profile_image: {
      type: String,
      default: null
    },
    is_active: {
      type: Boolean,
      default: true
    },
    is_approved: {
      type: Boolean,
      default: false
    },
    approved_at: {
      type: Date,
      default: null
    },
    deactivated_at: {
      type: Date,
      default: null
    },
    reactivated_at: {
      type: Date,
      default: null
    },
    deactivation_reason: {
      type: String,
      default: null
    },
    last_login_at: {
      type: Date,
      default: null
    },
    last_login_ip: {
      type: String,
      default: null
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password_hash;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true
    }
  }
);

userSchema.virtual("name").get(function getName() {
  return this.full_name;
});

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password_hash")) return;
  if (/^\$2[aby]\$\d+/.test(this.password_hash)) return;
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
});

userSchema.pre("validate", async function applyApprovalDefaults() {
  if (["patient", "admin"].includes(this.role) && this.is_approved === false) {
    this.is_approved = true;
  }

  if (this.is_approved && !this.approved_at) {
    this.approved_at = new Date();
  }

  if (!this.is_approved) {
    this.approved_at = null;
  }
});

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password_hash);
};

userSchema.methods.isVerified = function isVerified() {
  return true; // Simple auth, always verified
};

userSchema.methods.canAccess = function canAccess() {
  if (!this.is_active) return false;
  if (["doctor", "pharmacist"].includes(this.role)) return this.is_approved;
  return true;
};

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: email.toLowerCase() }).select("+password_hash");
};

userSchema.index({ role: 1 });
userSchema.index({ is_active: 1, role: 1 });

module.exports = mongoose.model("User", userSchema);
