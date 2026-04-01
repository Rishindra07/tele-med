const mongoose = require("mongoose");

const prescriptionOrderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
      index: true
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
      index: true
    },
    deliveryType: {
      type: String,
      enum: ["HOME", "PICKUP"],
      required: true
    },
    deliveryAddress: {
      type: String,
      trim: true,
      default: null
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Ready", "Delivered", "Cancelled"],
      default: "Pending",
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: null
    },
    estimatedDeliveryTime: {
      type: Date,
      default: null
    }
  },
  { timestamps: true, collection: "prescriptionorders" }
);

module.exports = mongoose.model("PrescriptionOrder", prescriptionOrderSchema);
