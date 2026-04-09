const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createRazorpayOrder, verifyPayment, getMyPayments, cancelPayment } = require("../controllers/paymentController");

router.post("/order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);
router.get("/my", protect, getMyPayments);
router.post("/cancel/:id", protect, cancelPayment);

module.exports = router;
