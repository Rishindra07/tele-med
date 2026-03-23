const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const pendingRegistrationSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      enum: ["patient", "doctor", "pharmacist", "admin"]
    },
    password_hash: {
      type: String,
      required: true,
      select: false
    },
    expires_at: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

pendingRegistrationSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password_hash")) return;
  if (/^\$2[aby]\$\d+\$/.test(this.password_hash)) return;
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
});

pendingRegistrationSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password_hash);
};

pendingRegistrationSchema.index({ email: 1 });
pendingRegistrationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PendingRegistration", pendingRegistrationSchema);
