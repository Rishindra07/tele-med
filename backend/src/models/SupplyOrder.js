const mongoose = require("mongoose");

const supplyOrderItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String },
  price: { type: Number }
});

const supplyOrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
  status: { 
    type: String, 
    enum: ["Draft", "Ordered", "Confirmed", "In transit", "Delivered", "Cancelled"], 
    default: "Draft" 
  },
  items: [supplyOrderItemSchema],
  totalAmount: { type: Number, default: 0 },
  placedDate: { type: Date },
  dueDate: { type: Date },
  completedAt: { type: Date },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Partial"], default: "Pending" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SupplyOrder", supplyOrderSchema);
