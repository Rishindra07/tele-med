const Supplier = require("../models/Supplier.js");
const SupplyOrder = require("../models/SupplyOrder.js");
const Pharmacy = require("../models/Pharmacy.js");
const PharmacyStock = require("../models/PharmacyStock.js");
const Prescription = require("../models/Prescription.js");
const mongoose = require("mongoose");

exports.getSuppliers = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user._id });
    if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found" });

    const suppliers = await Supplier.find({ pharmacy: pharmacy._id });
    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching suppliers" });
  }
};

exports.addSupplier = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user._id });
    const supplier = await Supplier.create({ ...req.body, pharmacy: pharmacy._id });
    res.status(201).json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ message: "Error adding supplier" });
  }
};

exports.getSupplyOrders = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user._id });
    if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found" });

    const orders = await SupplyOrder.find({ pharmacy: pharmacy._id })
      .populate("supplier")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching supply orders" });
  }
};

exports.getReorderSuggestions = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user._id });
    const [lowStock, pendingPrescriptions] = await Promise.all([
      PharmacyStock.find({ 
        pharmacy: pharmacy._id, 
        $expr: { $lte: ["$quantity", "$lowStockThreshold"] } 
      }).lean(),
      Prescription.find({ 
        assignedPharmacy: pharmacy._id, 
        fulfillmentStatus: { $in: ["Pending", "Partially Available"] } 
      }).lean()
    ]);

    const suggestions = [];

    // Suggestions from low stock
    lowStock.forEach(s => {
      suggestions.push({
        medicineName: s.medicineName,
        currentStock: s.quantity,
        reason: 'Low stock',
        priority: s.quantity <= 0 ? 'High' : 'Medium'
      });
    });

    // Suggestions from pending prescriptions (if not already added)
    pendingPrescriptions.forEach(p => {
      p.medications.forEach(m => {
        if (!suggestions.find(s => s.medicineName === m.name)) {
          suggestions.push({
            medicineName: m.name,
            currentStock: 0, // Simplified
            reason: 'Needed for prescription',
            priority: 'High'
          });
        }
      });
    });

    res.json({ success: true, suggestions: suggestions.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching suggestions" });
  }
};

exports.createSupplyOrder = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user._id });
    const count = await SupplyOrder.countDocuments();
    const orderId = `#ORD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    
    const order = await SupplyOrder.create({ 
      ...req.body, 
      orderId,
      pharmacy: pharmacy._id,
      placedDate: req.body.status !== 'Draft' ? new Date() : null
    });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Error creating supply order" });
  }
};

exports.updateSupplyOrder = async (req, res) => {
  try {
    const order = await SupplyOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Error updating supply order" });
  }
};
