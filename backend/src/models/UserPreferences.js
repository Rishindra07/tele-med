const mongoose = require("mongoose");

const userPreferencesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    notifications: {
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      }
    },
    dnd: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: {
        type: String,
        default: null
      },
      end: {
        type: String,
        default: null
      }
    },
    language: {
      type: String,
      default: "EN",
      enum: ["EN", "HI", "PA", "TA", "TE", "BN", "MR", "GU", "KN"]
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPreferences", userPreferencesSchema);
