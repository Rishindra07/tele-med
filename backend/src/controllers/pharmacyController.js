const Pharmacy = require("../models/Pharmacy");
const PharmacyStock = require("../models/PharmacyStock");
const User = require('../models/User');
const PrescriptionOrder = require("../models/PrescriptionOrder");

exports.getAllPharmacies = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        const pharmaciesRaw = await Pharmacy.find({})
            .populate('user', 'full_name email phone');

        // Helper to calculate distance in KM
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            if (!lat1 || !lon1 || !lat2 || !lon2) return null;
            const R = 6371; // Radius of the earth in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            const d = R * c; // Distance in km
            return Math.round(d * 10) / 10;
        };

        const pharmaciesMapped = pharmaciesRaw.map(p => {
          const ph = p.toObject();
          
          if (ph.location && ph.location.coordinates && Array.isArray(ph.location.coordinates)) {
            ph.location.lng = ph.location.coordinates[0];
            ph.location.lat = ph.location.coordinates[1];
          }

          if (!ph.location || !ph.location.lat) {
            // Mock coordinates near Lucknow if missing
            const baseLat = 26.8467 + (Math.random() - 0.5) * 0.1;
            const baseLng = 80.9462 + (Math.random() - 0.5) * 0.1;
            ph.location = { ...ph.location, lat: baseLat, lng: baseLng };
          }

          // Calculate dynamic distance if user location provided
          if (!isNaN(userLat) && !isNaN(userLng)) {
            ph.distanceKm = calculateDistance(userLat, userLng, ph.location.lat, ph.location.lng);
          }

          return ph;
        });

        // Sort by distance if user location provided
        if (!isNaN(userLat) && !isNaN(userLng)) {
          pharmaciesMapped.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
        }

        res.json({
            success: true,
            pharmacies: pharmaciesMapped
        });
    } catch (error) {
        console.error("Fetch Pharmacies Error:", error);
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

exports.updatePharmacyProfile = async (req, res) => {
    try {
        const {
            pharmacyName, ownerName, licenseNumber, gstin,
            address, city, district, pincode, location,
            phone, email, licenseCertificate, pharmacistRegNumber,
            pharmacistCertificate, shopPhoto, full_name
        } = req.body;

        // Update User info if needed
        if (full_name || phone) {
            const userUpdates = {};
            if (full_name) userUpdates.full_name = full_name;
            if (phone) userUpdates.phone = phone;
            await User.findByIdAndUpdate(req.user._id, userUpdates);
        }

        const updates = {};
        if (pharmacyName) updates.pharmacyName = pharmacyName;
        if (ownerName) updates.ownerName = ownerName;
        if (licenseNumber) updates.licenseNumber = licenseNumber;
        if (gstin) updates.gstin = gstin;
        if (address) updates.address = address;
        if (city) updates.city = city;
        if (district) updates.district = district;
        if (pincode) updates.pincode = pincode;
        if (location) updates.location = location;
        if (phone) updates.phone = phone;
        if (email) updates.email = email;
        if (licenseCertificate) updates.licenseCertificate = licenseCertificate;
        if (pharmacistRegNumber) updates.pharmacistRegNumber = pharmacistRegNumber;
        if (pharmacistCertificate) updates.pharmacistCertificate = pharmacistCertificate;
        if (shopPhoto) updates.shopPhoto = shopPhoto;

        const pharmacy = await Pharmacy.findOneAndUpdate(
            { user: req.user._id },
            { $set: updates },
            { new: true, upsert: true }
        );

        res.json({ success: true, pharmacy, message: "Pharmacy profile updated successfully" });
    } catch (error) {
        console.error("Update Pharmacy Profile Error:", error);
        res.status(500).json({ message: "Failed to update pharmacy profile" });
    }
};
