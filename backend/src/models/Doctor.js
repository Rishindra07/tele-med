const mongoose = require("mongoose");

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      trim: true,
      required: true
    },
    slots: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    specialization: {
      type: String,
      required: [true, "must provide specialization"],
      trim: true,
      index: true
    },
    profileImage: {
      type: String,
      trim: true,
      default: null
    },
    qualification: {
      type: String,
      required: [true, "must provide qualification"],
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      default: null
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
      max: 60
    },
    medicalLicense: {
      type: String,
      required: [true, "must provide medical license"],
      unique: true,
      trim: true
    },
    hospitalName: {
      type: String,
      required: [true, "must provide hospital name"],
      trim: true
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    consultation_modes: {
      type: [String],
      enum: ["video", "audio", "chat", "in_person"],
      default: ["video"]
    },
    languages: {
      type: [String],
      default: []
    },
    total_consultations: {
      type: Number,
      default: 0,
      min: 0
    },
    is_available_for_booking: {
      type: Boolean,
      default: true
    },
    availability: {
      type: [availabilitySlotSchema],
      default: []
    }
  },
  {
    timestamps: true,
    collection: "doctorprofiles"
  }
);

doctorSchema.index({ specialization: 1, rating: -1 });

module.exports = mongoose.model("Doctor", doctorSchema);
