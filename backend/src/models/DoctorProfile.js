const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization:String,
    experience:Number,
    medicalLicense:String,
    hospitalName:String,

    consultationFee:Number,
    availability:[String]
},{timeseries : true});

const DoctorProfile = new mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = DoctorProfile;