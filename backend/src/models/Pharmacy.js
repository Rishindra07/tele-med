const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    pharmacyName: {
      type: String,
      trim: true,
      required: true
    },
    licenseNumber: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    location: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    openTime: {
      type: String,
      trim: true,
      default: null
    },
    closeTime: {
      type: String,
      trim: true,
      default: null
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },
    distanceKm: {
      type: Number,
      min: 0,
      default: null
    },
    isJanAushadhi: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true, collection: "pharmacyprofiles" }
);

pharmacySchema.virtual("operatingHours").get(function getOperatingHours() {
  if (!this.openTime && !this.closeTime) return null;
  return `${this.openTime || "--:--"} - ${this.closeTime || "--:--"}`;
});

pharmacySchema.virtual("coordinates").get(function getCoordinates() {
  if (this.location && typeof this.location === "object") {
    return this.location.coordinates || null;
  }

  return null;
});

module.exports = mongoose.model("Pharmacy", pharmacySchema);
