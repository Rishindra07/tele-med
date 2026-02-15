const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'must provide name']
    },
    email:{
        type : String,
        required : [true,'must provide email'],
        unique:true
    },
    phone:{
        type:String,
        required:[true,'must provide phone'],
        unique : true
    },
    password : {
        type:String,
        required : [true,'must provide password']
    },
    role:{
        type:String,
        enum : ['patient','doctor','pharmacist','admin'],
        required:true
    },
    isVerified:{
        type :Boolean,
        default:false
    },
    isApproved:{
        type : Boolean,
        default:false
    }
},{timestamps : true});

const User = new mongoose.model('User',userSchema);

module.exports = User;