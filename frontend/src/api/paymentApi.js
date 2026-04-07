import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = user.token || localStorage.getItem('token') || '';
  return { Authorization: `Bearer ${token}` };
};

/**
 * Step 1 – Call backend to create a Razorpay order.
 * @param {number} amount - Amount in INR
 * @param {string} referenceId - Consultation or PrescriptionOrder ObjectId
 * @param {string} referenceType - 'consultation' | 'medicine_order'
 */
export const createPaymentOrder = async (amount, referenceId, referenceType) => {
  const { data } = await axios.post(
    `${BASE}/api/payments/order`,
    { amount, referenceId, referenceType },
    { headers: getAuthHeaders() }
  );
  return data; // { orderId, keyId, amount, currency, ... }
};

/**
 * Step 2 – Verify the Razorpay payment with the backend after the user completes checkout.
 */
export const verifyPayment = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const { data } = await axios.post(
    `${BASE}/api/payments/verify`,
    { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    { headers: getAuthHeaders() }
  );
  return data; // { success: true, paymentId }
};

/**
 * Fetches payment history for the logged-in user.
 */
export const fetchMyPayments = async () => {
  const { data } = await axios.get(`${BASE}/api/payments/my`, {
    headers: getAuthHeaders(),
  });
  return data;
};

/**
 * One-shot helper: creates a Razorpay order AND opens the Razorpay checkout modal.
 *
 * @param {object} options
 * @param {number}   options.amount          Amount in INR
 * @param {string}   options.referenceId     Mongo ObjectId of the linked document
 * @param {string}   options.referenceType   'consultation' | 'medicine_order'
 * @param {string}   options.name            Your brand / clinic name shown in the modal
 * @param {string}   options.description     Short description (e.g., "Consultation fee")
 * @param {object}   options.prefill         { name, email, contact } – user details
 * @param {function} options.onSuccess       Callback(paymentId) after successful payment
 * @param {function} options.onFailure       Optional callback on failure / cancel
 */
export const openRazorpayCheckout = async ({
  amount,
  referenceId,
  referenceType,
  name = 'Seva TeleMed',
  description = 'Consultation Payment',
  prefill = {},
  onSuccess,
  onFailure,
}) => {
  // Load Razorpay script dynamically if not already loaded
  if (!window.Razorpay) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }

  // Create the backend order
  const orderData = await createPaymentOrder(amount, referenceId, referenceType);

  const options = {
    key: orderData.keyId,
    amount: orderData.amount, // already in paise from backend
    currency: orderData.currency,
    name,
    description,
    order_id: orderData.orderId,
    prefill,
    theme: { color: '#3B82F6' },
    handler: async (response) => {
      // Verify on the backend
      const verification = await verifyPayment(
        response.razorpay_order_id,
        response.razorpay_payment_id,
        response.razorpay_signature
      );
      if (verification.success && onSuccess) {
        onSuccess(response.razorpay_payment_id);
      }
    },
    modal: {
      ondismiss: () => {
        if (onFailure) onFailure('Payment cancelled by user');
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    if (onFailure) onFailure(response.error.description);
  });
  rzp.open();
};
