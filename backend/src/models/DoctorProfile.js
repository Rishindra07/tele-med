const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization:{
        type:String,
        required:[true,'must provide specialization'],
    },
    profileImage:{
        type:String,
    },

    qualification : {
        type:String,
        required:[true,'must provide qualification']
    },

    bio : {
        type:String,
    },

    experience:{
        type:Number,
        default:0,
        min:0,
        max:60
    },

    medicalLicense:{
        type:String,
        required:[true,'must provide medical license'],
        unique:true
    },
    hospitalName:{
        type:String,
        required:[true,'must provide hospital name']
    },

    consultationFee:{
        type:Number,
        default:0,
        min:0,
    },

    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

    availability:[
        {
            day:String,
            slots:[String]
        }
    ]
},{timestamps : true});

const DoctorProfile = new mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = DoctorProfile;
