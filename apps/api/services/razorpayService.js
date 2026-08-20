const Razorpay = require("razorpay");
const crypto = require("crypto");

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn(
    "Razorpay credentials missing; refund features will be disabled."
  );
}

/**
 * Create a Razorpay refund for a payment.
 * @param {string} paymentId - The Razorpay payment ID (pay_...)
 * @param {number} [amount] - Amount to refund in paise (optional, full refund if omitted)
 * @param {string} [reason] - Reason for the refund
 * @returns {object|null} - Refund response object or null on failure
 */
async function createRazorpayRefund(paymentId, amount, reason = "") {
  if (!razorpayInstance) {
    console.warn("Razorpay not configured; cannot process refund");
    return null;
  }

  if (!paymentId || typeof paymentId !== "string") {
    console.warn("Invalid payment ID provided for refund");
    return null;
  }

  try {
    const refundOptions = {
      ...(amount ? { amount: Math.round(amount) } : {}),
      ...(reason ? { notes: { reason } } : {}),
    };

    const refund = await razorpayInstance.payments.refund(
      paymentId,
      refundOptions
    );
    return refund;
  } catch (error) {
    console.error(
      "Razorpay Refund Error:",
      error?.error?.description ||
        error?.error?.message ||
        error.message
    );
    return null;
  }
}

/**
 * Verify a Razorpay payment signature.
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - Whether the signature is valid
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
  const sign = orderId + "|" + paymentId;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(sign)
    .digest("hex");

  return expectedSign === signature;
}

/**
 * Get payment details from Razorpay.
 * @param {string} paymentId - The Razorpay payment ID
 * @returns {object|null} - Payment details or null on failure
 */
async function getPaymentDetails(paymentId) {
  if (!razorpayInstance || !paymentId) return null;

  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error(
      "Razorpay Fetch Payment Error:",
      error?.error?.description || error.message
    );
    return null;
  }
}

module.exports = {
  createRazorpayRefund,
  verifyPaymentSignature,
  getPaymentDetails,
};
