const Pharmacy = require("../models/Pharmacy");
const PharmacyStock = require("../models/PharmacyStock");
const User = require('../models/User');
const PrescriptionOrder = require("../models/PrescriptionOrder");

exports.getAllPharmacies = async (req, res) => {
    try {
        const pharmaciesRaw = await Pharmacy.find({})
            .populate('user', 'full_name email phone');

        // Ensure all pharmacies have some default location data for map
        const pharmacies = pharmaciesRaw.map(p => {
          const ph = p.toObject();
          if (!ph.location || !ph.location.lat) {
            // Mock coordinates near some central location or based on their pincode
            // Default center around a city for demo: [17.3850, 78.4867] Hyderabad
            // We'll generate a small random offset for each
            const baseLat = 17.3850 + (Math.random() - 0.5) * 0.1;
            const baseLng = 78.4867 + (Math.random() - 0.5) * 0.1;
            ph.location = { ...ph.location, lat: baseLat, lng: baseLng };
          }
          return ph;
        });

        res.json({
            success: true,
            pharmacies
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pharmacies" });
    }
};

exports.getPharmacyStock = async (req, res) => {
    try {
        const { id } = req.params;
        const stock = await PharmacyStock.find({ pharmacy: id });
        
        res.json({
            success: true,
            stock
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pharmacy stock" });
    }
};

exports.updateDeliverySettings = async (req, res) => {
    try {
        const { deliveryAvailable } = req.body;
        const pharmacy = await Pharmacy.findOneAndUpdate(
            { user: req.user._id },
            { deliveryAvailable },
            { new: true }
        );
        if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found" });
        res.json({ success: true, pharmacy });
    } catch (error) {
        res.status(500).json({ message: "Failed to update delivery settings" });
    }
};

exports.getIncomingOrders = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findOne({ user: req.user._id });
        if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found" });
        
        const orders = await PrescriptionOrder.find({ pharmacy: pharmacy._id })
            .populate("patient", "full_name email phone")
            .populate("prescription")
            .sort({ createdAt: -1 });
            
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const validStatuses = ["Pending", "Accepted", "Rejected", "Ready", "Delivered", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await PrescriptionOrder.findById(orderId).populate("pharmacy");
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Security check: Only the pharmacy owner can update the status
        if (order.pharmacy.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        order.status = status;
        await order.save();
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: "Failed to update order status" });
    }
};
