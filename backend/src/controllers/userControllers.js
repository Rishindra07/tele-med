const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const PatientProfile = require('../models/PatientProfile.js');
const DoctorProfile = require('../models/DoctorProfile.js');
const PharmacyProfile = require('../models/PharmacyProfile.js');

const OtpVerification = require('../models/OtpVerfication.js');

//registerUser
const registerUser = async(req,res)=>{
    try {
        const {
            name,
            email,
            phone,
            password,
            role,
            location,
            specialization,
            qualification,
            bio,
            experience,
            medicalLicense,
            hospitalName,
            consultationFee,
            pharmacyName,
            licenseNumber
        } = req.body;

        if(!name || !email || !phone || !password || !role){
            return res.status(400).json({message : "All fields are required"});
        }

        //Validate role
        if(!['patient','doctor','pharmacist'].includes(role)){
            return res.status(400).json({message : "Invalid role selected"});
        }

        //check existing user
        const existingUser = await User.findOne({$or : [{email},{phone}]});
        if(existingUser){
            return res.status(400).json({message : "User already exists"});
        }

        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        //create user
        const user = await User.create({
            name,
            email,
            phone,
            password : hashedPassword,
            role,
            isVerified : false,
            isApproved : role==='patient'?true:false
        });

        //create role based profile
        if(role==='patient'){
            await PatientProfile.create({
                user : user._id,
                location,
            });
        }

        if(role==='doctor'){
            if (!specialization || !qualification || !medicalLicense || !hospitalName) {
                return res.status(400).json({ message: "Doctor profile fields are required" });
            }

            await DoctorProfile.create({
                user : user._id,
                specialization,
                qualification,
                bio,
                experience,
                medicalLicense,
                hospitalName,
                consultationFee
            });
        }

        if(role==='pharmacist'){
            await PharmacyProfile.create({
                user : user._id,
                pharmacyName,
                licenseNumber,
                location
            });
        }

        res.status(201).json({
            success: true,
            message: `${role} registered successfully. Await verification.`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//sendOtp
const sendOtp = async(req,res)=>{
    try {
        const { phone } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // expiry 5 min
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // remove old OTP
        await OtpVerification.deleteMany({ phone });

        // save new OTP
        await OtpVerification.create({
            phone,
            otp,
            expiresAt
        });

        // 🔴 Replace with SMS API later
        console.log(`OTP for ${phone}: ${otp}`);

        res.json({ success: true, message: "OTP sent successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//verify otp
const verifyOtp = async(req,res)=>{
    try {
        const { phone, otp } = req.body;

        const record = await OtpVerification.findOne({ phone, otp });

        if (!record) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // activate user
        await User.findOneAndUpdate(
            { phone },
            { isVerified: true }
        );

        // delete otp after use
        await OtpVerification.deleteMany({ phone });

        res.json({ success: true, message: "Phone verified successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//login-user
const loginUser = async(req,res)=>{
    try {
        const { phone, password } = req.body;

        // 1️⃣ Check user
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 2️⃣ Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3️⃣ OTP verified?
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify OTP first" });
        }

        // 4️⃣ Doctor/Pharmacy approval
        if ((user.role === 'doctor' || user.role === 'pharmacist') && !user.isApproved) {
            return res.status(403).json({ message: "Waiting for admin approval" });
        }

        // 5️⃣ Create JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    registerUser,
    sendOtp,
    verifyOtp,
    loginUser
};
