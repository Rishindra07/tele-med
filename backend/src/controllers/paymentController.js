const Razorpay = require("razorpay");
const crypto = require("crypto");
const PrescriptionOrder = require("../models/PrescriptionOrder");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder",
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paisa
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("[PAYMENT] Create Razorpay Order Failed", error);
    res.status(500).json({ success: false, message: "Payment setup failed" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment verified
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature, payment verification failed",
      });
    }
  } catch (error) {
    console.error("[PAYMENT] Verify Payment Failed", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch consultations with payments
    const consultations = await require("../models/Consultation").find({
      patient: userId,
    }).populate("doctor", "full_name");

    // 2. Fetch medicine orders with payments
    const medicineOrders = await require("../models/PrescriptionOrder").find({
      patient: userId,
    }).populate("pharmacy", "pharmacyName");

    // 3. Format and combine
    const consultationPayments = consultations.map(c => ({
      id: c._id,
      type: "Consultation",
      description: `Appointment with Dr. ${c.doctor?.full_name || 'Expert'}`,
      amount: c.consultationFee || 0,
      status: c.paymentStatus,
      method: c.paymentMethod,
      date: c.createdAt,
    }));

    const orderPayments = medicineOrders.map(o => ({
      id: o._id,
      type: "Medicine Order",
      description: `Medicines from ${o.pharmacy?.pharmacyName || 'Pharmacy'}`,
      amount: o.totalAmount || 0,
      status: o.paymentStatus,
      method: o.paymentMethod,
      date: o.createdAt,
    }));

    const allPayments = [...consultationPayments, ...orderPayments].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      payments: allPayments,
    });
  } catch (error) {
    console.error("[PAYMENT] Get My Payments Failed", error);
    res.status(500).json({ success: false, message: "Failed to fetch payment history" });
  }
};
