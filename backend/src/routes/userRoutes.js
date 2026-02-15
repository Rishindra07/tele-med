const express = require('express')
const router = express.Router();
const {
    registerUser,
    sendOtp,
    verifyOtp,
    loginUser
} = require('../controllers/userControllers.js');

// router.get('/',getUsers);
router.post('/register',registerUser);
router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);
router.post('/login',loginUser);
module.exports = router;