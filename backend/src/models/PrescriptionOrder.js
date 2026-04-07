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
    items: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: null },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, default: 0 },
        instructions: { type: String, default: null }
      }
    ],
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
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD", "OFFLINE"],
      default: "OFFLINE"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Order Placed", "Pharmacy Accepted", "Packed", "Out for Delivery", "Delivered", "Cancelled", "Rejected", "Ready for Pickup"],
      default: "Order Placed",
      index: true
    },
    trackingHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" }
      }
    ],
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

prescriptionOrderSchema.pre("save", function() {
  if (this.isModified("status")) {
    this.trackingHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status updated to ${this.status}`
    });
  }
});

module.exports = mongoose.model("PrescriptionOrder", prescriptionOrderSchema);
