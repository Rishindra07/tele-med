const PharmacyProfile = require('../models/PharmacyProfile');
const User = require('../models/User');

exports.getAllPharmacies = async (req, res) => {
    try {
        const pharmacies = await PharmacyProfile.find({})
            .populate('user', 'name email phone');

        res.json({
            success: true,
            pharmacies
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pharmacies" });
    }
};
