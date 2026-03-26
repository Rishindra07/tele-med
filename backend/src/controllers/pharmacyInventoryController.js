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

    const { medicineName, genericName, strength, form, quantity, lowStockThreshold } = req.body;
    if (!medicineName) return res.status(400).json({ message: "Medicine name is required" });

    const item = await PharmacyStock.findOneAndUpdate(
      { pharmacy: pharmacyId, medicineName: medicineName.trim() },
      { pharmacy: pharmacyId, medicineName: medicineName.trim(), genericName, strength, form, quantity: Number(quantity) || 0, lowStockThreshold: Number(lowStockThreshold) || 10 },
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
    const pharmacyId = await getPharmacyId(req.user._id);
    if (!pharmacyId) return res.status(404).json({ message: "Pharmacy not found" });

    // Return low-stock items as expiry proxy (real expiry requires expiryDate field)
    const items = await PharmacyStock.find({
      pharmacy: pharmacyId,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
    }).sort({ quantity: 1 }).lean();

    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load expiry alerts" });
  }
};

/* -------- PROFILE UPDATE -------- */
exports.updatePharmacyProfile = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found" });
    return res.json({ success: true, pharmacy, message: "Profile updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update pharmacy profile" });
  }
};
