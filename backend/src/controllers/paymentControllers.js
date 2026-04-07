const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc Create a new Razorpay Order
 * @route POST /api/payments/create-order
 * @access Private (Patient/User)
 */
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Failed to create Razorpay order' });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ message: 'Razorpay error', error: error.message });
  }
};

/**
 * @desc Verify Razorpay Payment Signature
 * @route POST /api/payments/verify
 * @access Private (Patient/User)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isMatch = expectedSignature === razorpay_signature;

    if (isMatch) {
      // Payment successful
      res.status(200).json({ 
        message: 'Payment verified successfully', 
        success: true,
        paymentId: razorpay_payment_id 
      });
    } else {
      res.status(400).json({ 
        message: 'Payment verification failed', 
        success: false 
      });
    }
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
};
