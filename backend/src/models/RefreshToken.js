const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    device: {
      type: String,
      default: null
    },
    ip_address: {
      type: String,
      default: null
    },
    expires_at: {
      type: Date,
      required: true
    },
    is_revoked: {
      type: Boolean,
      default: false
    },
    revoked_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

refreshTokenSchema.index({ user_id: 1 });
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.revokeOne = function revokeOne(token) {
  return this.updateOne({ token }, { is_revoked: true, revoked_at: new Date() });
};

refreshTokenSchema.statics.revokeAll = function revokeAll(userId) {
  return this.updateMany(
    { user_id: userId, is_revoked: false },
    { is_revoked: true, revoked_at: new Date() }
  );
};

refreshTokenSchema.statics.findValid = function findValid(token) {
  return this.findOne({
    token,
    is_revoked: false,
    expires_at: { $gt: new Date() }
  });
};

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
