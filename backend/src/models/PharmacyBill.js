const mongoose = require("mongoose");

const pharmacyBillSchema = new mongoose.Schema(
  {
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
      index: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null
    },
    billNumber: {
      type: String,
      required: true,
      unique: true
    },
    items: [
      {
        medicineName: String,
        quantity: Number,
        mrp: Number,
        total: Number,
        isJanAushadhi: Boolean
      }
    ],
    summary: {
      taxableAmount: { type: Number, default: 0 },
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      totalGst: { type: Number, default: 0 },
      exemptAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 }
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Credit", "Card"],
      default: "Cash"
    },
    billType: {
      type: String,
      enum: ["Prescription", "Walk-in"],
      default: "Prescription"
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PharmacyBill", pharmacyBillSchema);
