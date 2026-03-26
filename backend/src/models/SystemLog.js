const mongoose = require("mongoose");

const systemLogSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      trim: true,
      required: true
    },
    path: {
      type: String,
      trim: true,
      required: true,
      index: true
    },
    statusCode: {
      type: Number,
      required: true,
      index: true
    },
    durationMs: {
      type: Number,
      required: true,
      min: 0
    },
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      default: "info",
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    role: {
      type: String,
      trim: true,
      default: null
    },
    ip: {
      type: String,
      trim: true,
      default: null
    }
  },
  { timestamps: true }
);

systemLogSchema.index({ createdAt: -1, level: 1 });

module.exports = mongoose.model("SystemLog", systemLogSchema);
