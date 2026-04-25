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
    pharmacyName: { type: String, trim: true, required: true },
    ownerName: { type: String, trim: true },
    licenseNumber: { type: String, trim: true, required: true, unique: true },
    licenceValidTill: { type: Date },
    gstin: { type: String, trim: true },
    isGstinVerified: { type: Boolean, default: false },
    janAushadhiId: { type: String, trim: true },
    janAushadhiValidTill: { type: Date },
    address: { type: String },
    city: { type: String },
    district: { type: String },
    pincode: { type: String },
    aadhaarNumber: { type: String },
    isAadhaarVerified: { type: Boolean, default: false },
    location: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    openTime: { type: String, trim: true, default: "08:00 AM" },
    closeTime: { type: String, trim: true, default: "09:00 PM" },
    operatingHoursDesc: { type: String, default: "Mon–Sat 8:00 AM — 9:00 PM\nSunday 9:00 AM — 2:00 PM" },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    distanceKm: { type: Number, min: 0, default: 0.8 },
    isJanAushadhi: { type: Boolean, default: false, index: true },
    expirySettings: {
      alertDays: { type: Number, default: 30 },
      smsAlert: { type: Boolean, default: true },
      autoReturn: { type: Boolean, default: false }
    },
    pharmacyId: { type: String, unique: true },
    visibleToPatients: { type: Boolean, default: true },
    deliveryAvailable: { type: Boolean, default: false },
    licenseCertificate: { type: String, default: null },
    pharmacistRegNumber: { type: String, trim: true },
    pharmacistCertificate: { type: String, default: null },
    shopPhoto: { type: String, default: null }
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
