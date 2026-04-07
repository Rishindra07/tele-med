const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createRazorpayOrder, verifyPayment, getMyPayments } = require("../controllers/paymentController");

router.post("/order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);
router.get("/my", protect, getMyPayments);

module.exports = router;
