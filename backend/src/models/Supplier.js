const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Supplier", supplierSchema);
