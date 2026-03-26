const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      default: null
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null
    },
    type: {
      type: String,
      enum: ["prescription", "lab_report", "consultation_note", "imaging", "vaccination", "other", "note", "vaccine"],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    consultationSummary: {
      type: String,
      trim: true,
      default: null
    },
    diagnosis: {
      type: String,
      trim: true,
      default: null
    },
    prescriptionDetails: {
      type: [
        new mongoose.Schema(
          {
            name: {
              type: String,
              trim: true,
              required: true
            },
            dosage: {
              type: String,
              trim: true,
              default: null
            },
            frequency: {
              type: String,
              trim: true,
              default: null
            },
            duration: {
              type: String,
              trim: true,
              default: null
            },
            instructions: {
              type: String,
              trim: true,
              default: null
            }
          },
          { _id: false }
        )
      ],
      default: []
    },
    labTests: {
      type: [String],
      default: []
    },
    doctorInfo: {
      type: new mongoose.Schema(
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
          },
          name: {
            type: String,
            trim: true,
            required: true
          },
          email: {
            type: String,
            trim: true,
            default: null
          },
          specialization: {
            type: String,
            trim: true,
            default: null
          },
          medicalLicense: {
            type: String,
            trim: true,
            default: null
          }
        },
        { _id: false }
      ),
      default: null
    },
    description: {
      type: String,
      trim: true,
      default: null
    },
    fileUrl: {
      type: String,
      trim: true,
      default: null
    },
    mimeType: {
      type: String,
      trim: true,
      default: null
    },
    fileSizeBytes: {
      type: Number,
      min: 0,
      default: null
    },
    isOfflineAvailable: {
      type: Boolean,
      default: false,
      index: true
    },
    source: {
      type: String,
      enum: ["uploaded", "generated", "external"],
      default: "uploaded"
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, collection: "medicalrecords" }
);

healthRecordSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.models.HealthRecord || mongoose.model("HealthRecord", healthRecordSchema);
