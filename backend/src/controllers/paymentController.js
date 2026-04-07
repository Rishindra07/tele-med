const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Consultation = require('../models/Consultation');
const PrescriptionOrder = require('../models/PrescriptionOrder');

// Initialize Razorpay with env credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc   Create a Razorpay Order for appointment or medicine order
 * @route  POST /api/payments/order
 * @access Private
 * @body   { amount, currency?, referenceId, referenceType }
 *   - referenceType: 'consultation' | 'medicine_order'
 *   - referenceId:   ObjectId of the Consultation or PrescriptionOrder
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const {
      amount,
      currency = 'INR',
      referenceId,
      referenceType,
    } = req.body;

    if (!amount || !referenceId || !referenceType) {
      return res.status(400).json({
        message: 'amount, referenceId and referenceType are required',
      });
    }

    if (!['consultation', 'medicine_order'].includes(referenceType)) {
      return res.status(400).json({
        message: 'referenceType must be "consultation" or "medicine_order"',
      });
    }

    const receipt = `rcpt_${referenceType.slice(0, 4)}_${Date.now()}`;

    // Create order on Razorpay
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt,
    });

    if (!rzpOrder) {
      return res.status(500).json({ message: 'Failed to create Razorpay order' });
    }

    // Persist order record in DB
    const payment = await Payment.create({
      user: req.user._id,
      referenceId,
      referenceType,
      razorpayOrderId: rzpOrder.id,
      amount,
      currency,
      receipt,
      status: 'created',
    });

    res.status(201).json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      receipt: rzpOrder.receipt,
      paymentDbId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID, // send key_id so frontend can init checkout
    });
  } catch (error) {
    console.error('Razorpay createOrder error:', error);
    res.status(500).json({ message: 'Payment error', error: error.message });
  }
};

/**
 * @desc   Verify Razorpay payment signature & mark records as paid
 * @route  POST /api/payments/verify
 * @access Private
 * @body   { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment fields' });
    }

    // Verify HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({
        message: 'Payment verification failed – invalid signature',
        success: false,
      });
    }

    // Update Payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Update the linked document
    if (payment.referenceType === 'consultation') {
      await Consultation.findByIdAndUpdate(payment.referenceId, {
        paymentStatus: 'Paid',
        paymentMethod: 'Online',
      });
    } else if (payment.referenceType === 'medicine_order') {
      await PrescriptionOrder.findByIdAndUpdate(payment.referenceId, {
        paymentStatus: 'Paid',
        paymentMethod: 'UPI',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and recorded successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Razorpay verifyPayment error:', error);
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
};

/**
 * @desc   Get all payments for the logged-in patient
 * @route  GET /api/payments/my
 * @access Private
 */
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('getMyPayments error:', error);
    res.status(500).json({ message: 'Could not fetch payments', error: error.message });
  }
};
