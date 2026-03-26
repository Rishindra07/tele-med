const Pharmacy = require("../models/Pharmacy");
const PharmacyStock = require("../models/PharmacyStock");
const User = require('../models/User');

exports.getAllPharmacies = async (req, res) => {
    try {
        const pharmacies = await Pharmacy.find({})
            .populate('user', 'full_name email phone');

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
