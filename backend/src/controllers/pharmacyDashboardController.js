const Notification = require("../models/Notification.js");
const Pharmacy = require("../models/Pharmacy.js");
const PharmacyStock = require("../models/PharmacyStock.js");
const Prescription = require("../models/Prescription.js");
const PrescriptionOrder = require("../models/PrescriptionOrder.js");

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

exports.getPharmacyDashboard = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user._id }).lean();
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy profile not found" });
    }

    const today = startOfToday();

    const [prescriptions, stocks, notifications, orders] = await Promise.all([
      Prescription.find({
        $or: [{ assignedPharmacy: pharmacy._id }, { assignedPharmacy: null }]
      })
        .populate("patient", "full_name email phone")
        .populate("doctor", "full_name email phone")
        .sort({ issuedAt: -1 })
        .lean(),
      PharmacyStock.find({ pharmacy: pharmacy._id }).sort({ quantity: 1, medicineName: 1 }).lean(),
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      PrescriptionOrder.find({ pharmacy: pharmacy._id })
        .populate("patient", "full_name email phone")
        .populate("prescription")
        .sort({ createdAt: -1 })
        .lean()
    ]);

    const prescriptionsToday = prescriptions.filter((item) => new Date(item.createdAt) >= today);
    const pending = prescriptions.filter((item) => item.fulfillmentStatus === "Pending");
    const ready = prescriptions.filter((item) => item.fulfillmentStatus === "Ready");
    const completedToday = prescriptions.filter(
      (item) => item.fulfillmentStatus === "Completed" && item.completedAt && new Date(item.completedAt) >= today
    );
    const lowStockItems = stocks.filter((stock) => stock.quantity > 0 && stock.quantity <= stock.lowStockThreshold);
    const outOfStockItems = stocks.filter((stock) => stock.quantity <= 0);

    return res.json({
      success: true,
      profile: {
        user: {
          _id: req.user._id,
          full_name: req.user.full_name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role
        },
        pharmacy
      },
      summary: {
        prescriptionsToday: prescriptionsToday.length,
        pendingPrescriptions: pending.length,
        readyPrescriptions: ready.length,
        completedToday: completedToday.length,
        inventoryItems: stocks.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length
      },
      prescriptions: prescriptions.slice(0, 10),
      orders: orders.slice(0, 10),
      lowStockItems: lowStockItems.slice(0, 10),
      outOfStockItems: outOfStockItems.slice(0, 10),
      notifications
    });
  } catch (error) {
    console.error("[PHARMACY] dashboard failed", error);
    return res.status(500).json({ message: "Failed to load pharmacy dashboard" });
  }
};

exports.getPharmacyProfile = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user._id }).lean();
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy profile not found" });
    }

    const [stockCount, prescriptions] = await Promise.all([
      PharmacyStock.countDocuments({ pharmacy: pharmacy._id }),
      Prescription.find({ assignedPharmacy: pharmacy._id }).lean()
    ]);

    const stats = {
      stockCount,
      staffCount: 1, // Will expand later
      yearsOnSeva: Math.ceil((new Date() - new Date(pharmacy.createdAt)) / (1000 * 60 * 60 * 24 * 365)) || 1,
      prescriptionsReceived: prescriptions.length,
      fulfilledCount: prescriptions.filter(p => p.fulfillmentStatus === 'Completed').length,
      patientRating: 4.7, // Placeholder or from Complaint/Feedback
      reviewCount: 88,
    };

    return res.json({
      success: true,
      user: {
        _id: req.user._id,
        full_name: req.user.full_name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        preferred_language: req.user.preferred_language
      },
      pharmacy,
      stats
    });
  } catch (error) {
    console.error("[PHARMACY] profile failed", error);
    return res.status(500).json({ message: "Failed to load pharmacy profile" });
  }
};
