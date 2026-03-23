const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required : true
    },
    address:String, // Changed from location
    dob:String,     // Added DOB
    gender:String,
    bloodGroup:String,
    allergies:[String],
    chronicDiseases:[String],
    settings: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
},{timestamps:true});

const PatientProfile = new mongoose.model('PatientProfile',patientProfileSchema);

module.exports = PatientProfile;