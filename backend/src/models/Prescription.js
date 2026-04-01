const crypto = require("crypto");
const mongoose = require("mongoose");

const medicationItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
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
);

const digitalSignatureSchema = new mongoose.Schema(
  {
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    signerName: {
      type: String,
      required: true,
      trim: true
    },
    signerRole: {
      type: String,
      default: "doctor",
      trim: true
    },
    doctorLicense: {
      type: String,
      trim: true,
      default: null
    },
    signatureHash: {
      type: String,
      required: true,
      trim: true
    },
    signedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const fulfillmentItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    requestedQuantity: {
      type: Number,
      default: 1,
      min: 0
    },
    availableQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    stockStatus: {
      type: String,
      enum: ["pending", "ready", "partial", "unavailable"],
      default: "pending"
    },
    pharmacyStock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PharmacyStock",
      default: null
    }
  },
  { _id: false }
);

const buildPrescriptionId = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `RX-${datePart}-${randomPart}`;
};

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: buildPrescriptionId,
      trim: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      default: null
    },
    medications: {
      type: [medicationItemSchema],
      default: []
    },
    diagnosis: {
      type: String,
      trim: true,
      default: null
    },
    labTests: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      trim: true,
      default: null
    },
    followUpDate: {
      type: Date,
      default: null
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    validUntil: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    pdfUrl: {
      type: String,
      trim: true,
      default: null
    },
    verificationUrl: {
      type: String,
      trim: true,
      default: null
    },
    qrCodeData: {
      type: String,
      trim: true,
      default: null
    },
    assignedPharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      default: null
    },
    fulfillmentStatus: {
      type: String,
      enum: ["Pending", "Ready", "Partially Available", "Completed"],
      default: "Pending",
      index: true
    },
    fulfillmentItems: {
      type: [fulfillmentItemSchema],
      default: []
    },
    readyForPickupAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    pharmacyNotes: {
      type: String,
      trim: true,
      default: null
    },
    fulfillmentHistory: {
      type: [
        new mongoose.Schema(
          {
            status: {
              type: String,
              trim: true,
              required: true
            },
            pharmacy: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Pharmacy",
              default: null
            },
            note: {
              type: String,
              trim: true,
              default: null
            },
            updatedAt: {
              type: Date,
              default: Date.now
            }
          },
          { _id: false }
        )
      ],
      default: []
    },
    digitalSignature: {
      type: digitalSignatureSchema,
      default: null
    }
  },
  { timestamps: true }
);

prescriptionSchema.pre("save", function syncActiveState() {
  if (this.validUntil && this.validUntil < new Date()) {
    this.isActive = false;
  }

  if (this.fulfillmentStatus === "Ready" && !this.readyForPickupAt) {
    this.readyForPickupAt = new Date();
  }

  if (this.fulfillmentStatus !== "Ready") {
    this.readyForPickupAt = null;
  }

  if (this.fulfillmentStatus === "Completed" && !this.completedAt) {
    this.completedAt = new Date();
  }
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
