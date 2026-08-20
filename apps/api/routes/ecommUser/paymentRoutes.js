const crypto = require("crypto");
const express = require("express");
const razorpay = require("../../config/razorpay.js");
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const Payment = require("../../models/shared/Payment.js");
const { buildProductCartQuote } = require("../../services/checkoutService.js");

const router = express.Router();
const customerRoles = ["buyer", "admin", "eventOwner", "learner", "jobSeeker"];

router.get("/quote", auth, requireRole(...customerRoles), async (req, res) => {
  try {
    const quote = await buildProductCartQuote(req.user.id);
    res.json({ success: true, items: quote.items, quote: quote.summary });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to prepare checkout quote",
    });
  }
});

router.post("/create-order", auth, requireRole(...customerRoles), async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ success: false, message: "Payment service not configured" });
    }

    const quote = await buildProductCartQuote(req.user.id);
    const currency = "INR";
    const receipt = `cart_${String(req.user.id).slice(-8)}_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: Math.round(quote.summary.total * 100),
      currency,
      receipt,
    });

    const paymentMethod = ["card", "upi", "wallet", "netbanking", "emi"].includes(req.body.paymentMethod)
      ? req.body.paymentMethod
      : "pending";
    await Payment.create({
      userId: req.user.id,
      paymentFor: "product_order",
      subtotal: quote.summary.subtotal,
      platformFee: quote.summary.serviceFee,
      gst: quote.summary.tax,
      totalAmount: quote.summary.total,
      currency,
      paymentMethod,
      orderId: order.id,
      receipt: order.receipt || receipt,
      status: "pending",
      metadata: {
        cartId: quote.cartId,
        items: quote.items,
        summary: quote.summary,
        emiMonths: Number(req.body.emi?.months) || 0,
      },
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      quote: quote.summary,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Payment order creation failed",
    });
  }
});

router.post("/verify", auth, requireRole(...customerRoles), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Incomplete payment verification data" });
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, message: "Payment service not configured" });
    }

    const payment = await Payment.findOne({
      userId: req.user.id,
      orderId: razorpay_order_id,
      paymentFor: "product_order",
    });
    if (!payment) return res.status(404).json({ success: false, message: "Payment order not found" });

    if (payment.status === "completed" && payment.transactionId === razorpay_payment_id) {
      return res.json({ success: true, message: "Payment already verified", paymentId: String(payment._id) });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const suppliedBuffer = Buffer.from(String(razorpay_signature));
    const expectedBuffer = Buffer.from(expected);
    const valid = suppliedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
    if (!valid) return res.status(400).json({ success: false, message: "Invalid payment signature" });

    payment.transactionId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = "completed";
    payment.paidAt = new Date();
    await payment.save();

    res.json({ success: true, message: "Payment verified successfully", paymentId: String(payment._id) });
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
});

router.get("/key", (_req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
