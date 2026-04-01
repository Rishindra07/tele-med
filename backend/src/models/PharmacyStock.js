const mongoose = require("mongoose");

const pharmacyStockSchema = new mongoose.Schema(
  {
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
      index: true
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    genericName: {
      type: String,
      trim: true,
      default: null
    },
    strength: {
      type: String,
      trim: true,
      default: null
    },
    form: {
      type: String,
      trim: true,
      default: null
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0
    },
    category: {
      type: String,
      trim: true,
      default: "General"
    },
    batchNumber: {
      type: String,
      trim: true,
      default: null
    },
    mrp: {
      type: Number,
      default: 0
    },
    expiryDate: {
      type: Date,
      default: null
    },
    rackLocation: {
      type: String,
      trim: true,
      default: null
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

pharmacyStockSchema.index({ pharmacy: 1, medicineName: 1 }, { unique: true });

pharmacyStockSchema.virtual("stockStatus").get(function getStockStatus() {
  if (this.quantity <= 0) return "out_of_stock";
  if (this.quantity <= this.lowStockThreshold) return "low_stock";
  return "available";
});

pharmacyStockSchema.pre("save", function syncLastUpdated(next) {
  this.lastUpdatedAt = new Date();
  next();
});

module.exports = mongoose.model("PharmacyStock", pharmacyStockSchema);
