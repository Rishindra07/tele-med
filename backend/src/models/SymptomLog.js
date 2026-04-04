const mongoose = require("mongoose");

const symptomLogSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Must Provide the user id"],
      index: true
    },
    symptoms: {
      type: [String],
      required: [true, "Must Provide symptoms"],
      default: []
    },
    duration: {
      type: String,
      trim: true,
      default: null
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low"
    },
    predictedConditions: {
      type: [String],
      default: []
    },
    ai_result: {
      summary: {
        type: String,
        trim: true,
        default: null
      },
      triage: {
        type: String,
        trim: true,
        default: null
      },
      recommendations: {
        type: [String],
        default: []
      }
    },
    advice: {
      type: String,
      trim: true,
      default: "Follow general precautions"
    },
    suggestedSpecialization: {
      type: String,
      trim: true,
      default: "General Physician"
    },
    aiSource: {
      type: String,
      enum: ["online_ml", "offline_rule_based", "cloud", "local", "unknown"],
      default: "unknown"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

symptomLogSchema.virtual("check_mode").get(function getCheckMode() {
  if (this.aiSource === "cloud") return "online_ml";
  if (this.aiSource === "local") return "offline_rule_based";
  return this.aiSource;
});

module.exports = mongoose.model("SymptomLog", symptomLogSchema);
