const PharmacyStock = require("../models/PharmacyStock.js");
const Pharmacy = require("../models/Pharmacy.js");

const getPharmacyId = async (userId) => {
  const pharmacy = await Pharmacy.findOne({ user: userId }).lean();
  return pharmacy?._id || null;
};

/* -------- INVENTORY -------- */
exports.getInventory = async (req, res) => {
  try {
    const pharmacyId = await getPharmacyId(req.user._id);
    if (!pharmacyId) return res.status(404).json({ message: "Pharmacy not found" });

    const query = { pharmacy: pharmacyId };
    if (req.query.search) {
      query.medicineName = new RegExp(req.query.search, "i");
    }
    const items = await PharmacyStock.find(query).sort({ medicineName: 1 }).lean();
    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load inventory" });
  }
};

exports.addInventoryItem = async (req, res) => {
  try {
    const pharmacyId = await getPharmacyId(req.user._id);
    if (!pharmacyId) return res.status(404).json({ message: "Pharmacy not found" });

    const { 
      medicineName, genericName, strength, form, quantity, 
      lowStockThreshold, category, batchNumber, mrp, expiryDate, rackLocation 
    } = req.body;
    if (!medicineName) return res.status(400).json({ message: "Medicine name is required" });

    const item = await PharmacyStock.findOneAndUpdate(
      { pharmacy: pharmacyId, medicineName: medicineName.trim() },
      { 
        pharmacy: pharmacyId, 
        medicineName: medicineName.trim(), 
        genericName, strength, form, 
        quantity: Number(quantity) || 0, 
        lowStockThreshold: Number(lowStockThreshold) || 10,
        category, batchNumber, mrp: Number(mrp) || 0, 
        expiryDate: expiryDate ? new Date(expiryDate) : null, 
        rackLocation
      },
      { upsert: true, new: true }
    );
    return res.status(201).json({ success: true, item });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Medicine already exists in inventory" });
    return res.status(500).json({ message: "Failed to add item" });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const pharmacyId = await getPharmacyId(req.user._id);
    if (!pharmacyId) return res.status(404).json({ message: "Pharmacy not found" });

    const item = await PharmacyStock.findOneAndUpdate(
      { _id: req.params.id, pharmacy: pharmacyId },
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.json({ success: true, item });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update item" });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const pharmacyId = await getPharmacyId(req.user._id);
    if (!pharmacyId) return res.status(404).json({ message: "Pharmacy not found" });

    const item = await PharmacyStock.findOneAndDelete({ _id: req.params.id, pharmacy: pharmacyId });
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete item" });
  }
};

/* -------- EXPIRY -------- */
exports.getExpiryAlerts = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user._id }).lean();
    if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found" });

    const inventory = await PharmacyStock.find({ 
      pharmacy: pharmacy._id, 
      expiryDate: { $ne: null } 
    }).sort({ expiryDate: 1 }).lean();

    const now = new Date();
    const alerts = inventory.map(item => {
      const daysRemaining = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
      let status = 'Watch';
      if (daysRemaining <= 30) status = 'Critical';
      else if (daysRemaining <= 90) status = 'Warning';

      return {
        ...item,
        daysRemaining: Math.max(0, daysRemaining),
        atRiskRevenue: item.quantity * item.mrp,
        status
      };
    }).filter(a => a.daysRemaining <= 180); // Only show within 6 months

    const summary = {
      critical: alerts.filter(a => a.status === 'Critical').length,
      warning: alerts.filter(a => a.status === 'Warning').length,
      watch: alerts.filter(a => a.status === 'Watch').length,
      totalLoss: Math.round(alerts.reduce((sum, a) => sum + (a.atRiskRevenue || 0), 0))
    };

    return res.json({ 
      success: true, 
      alerts, 
      summary,
      settings: pharmacy.expirySettings || { alertDays: 30, smsAlert: true, autoReturn: false }
    });
  } catch (err) {
    console.error('[EXPIRY_ALERTS] Error:', err);
    return res.status(500).json({ message: "Failed to load expiry alerts" });
  }
};


