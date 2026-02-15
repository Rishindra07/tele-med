const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required : true
    },
    location:String,
    age:Number,
    gender:String,
    bloodGroup:String,
    allergies:[String],
    chronicDiseases:[String]
},{timestamps:true});

const PatientProfile = new mongoose.model('PatientProfile',patientProfileSchema);

module.exports = PatientProfile;