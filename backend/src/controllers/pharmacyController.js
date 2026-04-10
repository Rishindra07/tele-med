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

exports.checkStockAndPrice = async (req, res) => {
    try {
        const { pharmacyId, items } = req.body;
        if (!pharmacyId || !Array.isArray(items)) {
            return res.status(400).json({ message: "pharmacyId and items array are required" });
        }

        // Case-insensitive matching for medicine names
        const itemNames = items.map(item => new RegExp(`^${item.name}$`, "i"));
        
        const stocks = await PharmacyStock.find({
            pharmacy: pharmacyId,
            medicineName: { $in: itemNames }
        });

        const results = items.map(item => {
            const stock = stocks.find(s => s.medicineName.toLowerCase() === item.name.toLowerCase());
            return {
                name: item.name,
                available: stock ? stock.quantity : 0,
                price: stock ? stock.mrp : 150, // Default 150 if not found
                inStock: stock ? stock.quantity >= (item.quantity || 1) : false
            };
        });

        res.json({
            success: true,
            results
        });

    } catch (error) {
        console.error("[STOCK_CHECK] error:", error);
        res.status(500).json({ message: "Failed to verify stock" });
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
        const { orderId, status: rawStatus } = req.body;
        
        // Normalize status names from frontend to match schema enum
        let status = rawStatus;
        if (status === "Accepted") status = "Pharmacy Accepted";
        if (status === "Ready") status = "Ready for Pickup";

        const validStatuses = ["Order Placed", "Pharmacy Accepted", "Packed", "Out for Delivery", "Delivered", "Cancelled", "Rejected", "Ready for Pickup"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status: ${rawStatus}` });
        }

        const order = await PrescriptionOrder.findById(orderId).populate("pharmacy");
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Security check: Only the pharmacy owner can update the status
        if (!order.pharmacy || order.pharmacy.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        order.status = status;
        await order.save();
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: "Failed to update order status" });
    }
};
