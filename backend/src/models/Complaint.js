const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    againstUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    category: {
      type: String,
      enum: ["consultation", "pharmacy", "payment", "technical", "abuse", "other"],
      default: "other",
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Open", "In Review", "Resolved"],
      default: "Open",
      index: true
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
