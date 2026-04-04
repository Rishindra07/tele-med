const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null
    },
    relation: {
      type: String,
      trim: true,
      default: null
    },
    phone: {
      type: String,
      trim: true,
      default: null
    }
  },
  { _id: false }
);

const vitalsSchema = new mongoose.Schema(
  {
    height_cm: {
      type: Number,
      min: 0,
      default: null
    },
    weight_kg: {
      type: Number,
      min: 0,
      default: null
    },
    bmi: {
      type: Number,
      min: 0,
      default: null
    },
    blood_pressure: {
      systolic: {
        type: Number,
        min: 0,
        default: null
      },
      diastolic: {
        type: Number,
        min: 0,
        default: null
      }
    },
    pulse_bpm: {
      type: Number,
      min: 0,
      default: null
    },
    spo2_percent: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    glucose_mg_dl: {
      type: Number,
      min: 0,
      default: null
    },
    temperature_c: {
      type: Number,
      min: 0,
      default: null
    },
    updated_at: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    address: {
      type: String,
      trim: true,
      default: null
    },
    dob: {
      type: String,
      trim: true,
      default: null
    },
    age: {
      type: Number,
      min: 0,
      default: null
    },
    gender: {
      type: String,
      trim: true,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: undefined
    },
    bloodGroup: {
      type: String,
      trim: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: undefined
    },
    allergies: {
      type: [String],
      default: []
    },
    chronicDiseases: {
      type: [String],
      default: []
    },
    medications: {
      type: [String],
      default: []
    },
    medical_history_notes: {
      type: String,
      trim: true,
      default: null
    },
    emergency_contact: {
      type: emergencyContactSchema,
      default: () => ({})
    },
    vitals: {
      type: vitalsSchema,
      default: () => ({})
    },
    insurance: {
      provider: {
        type: String,
        trim: true,
        default: null
      },
      policy_number: {
        type: String,
        trim: true,
        default: null
      }
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "patientprofiles"
  }
);

patientSchema.virtual("completion_percentage").get(function getCompletionPercentage() {
  const checks = [
    Boolean(this.address),
    Boolean(this.dob),
    Boolean(this.gender),
    Boolean(this.bloodGroup),
    Array.isArray(this.allergies),
    Array.isArray(this.chronicDiseases),
    Boolean(this.emergency_contact?.name),
    Boolean(this.emergency_contact?.phone),
    Boolean(this.vitals?.height_cm),
    Boolean(this.vitals?.weight_kg)
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
});

patientSchema.virtual("health_tags").get(function getHealthTags() {
  return {
    blood_group: this.bloodGroup || null,
    conditions: this.chronicDiseases || [],
    allergies: this.allergies || []
  };
});

patientSchema.pre("save", async function updateDerivedVitals() {
  const heightCm = this.vitals?.height_cm;
  const weightKg = this.vitals?.weight_kg;

  if (heightCm && weightKg) {
    const heightM = heightCm / 100;
    this.vitals.bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  }

  if (this.isModified("vitals")) {
    this.vitals.updated_at = new Date();
  }
});

module.exports = mongoose.model("Patient", patientSchema);
