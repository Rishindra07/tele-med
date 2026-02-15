const mongoose = require('mongoose');

const pharmacyProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    pharmacyName : String,
    licenseNumber : String,
    location : String,
    openTime:String,
    closeTime:String

},{timestamps:true});

const PharmacyProfile = new mongoose.model('PharmacyProfile', pharmacyProfileSchema)

module.exports = PharmacyProfile;