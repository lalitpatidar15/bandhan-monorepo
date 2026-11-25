const crypto = require("crypto");
const express = require("express");
const razorpay = require("../../config/razorpay.js");
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const Payment = require("../../models/shared/Payment.js");
const Booking = require("../../models/shared/Booking.js");
const Service = require("../../models/shared/Service.js");
const Venue = require("../../models/shared/Venue.js");
const User = require("../../models/shared/User.js");
const { buildProductCartQuote } = require("../../services/checkoutService.js");
const { recordBookingEarnings } = require("../../services/vendorEarningsService.js");

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

function signatureIsValid(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const supplied = Buffer.from(String(signature));
  const expectedBuffer = Buffer.from(expected);
  return supplied.length === expectedBuffer.length && crypto.timingSafeEqual(supplied, expectedBuffer);
}

async function resolveBookingProvider(booking) {
  if (booking.bookingType === "service") {
    const serviceId = booking.items?.[0]?.serviceId;
    const service = serviceId ? await Service.findById(serviceId).select("sellerId title") : null;
    const providerId = service?.sellerId || booking.items?.[0]?.providerId;
    if (!providerId) return null;
    const provider = await User.findById(providerId).select("fullName name email");
    return {
      vendorId: providerId,
      vendorName: provider?.fullName || provider?.name || service?.title || "Service provider",
      vendorType: "service",
    };
  }

  const venue = await Venue.findById(booking.venueId).select("sellerId name");
  if (venue?.sellerId) {
    const provider = await User.findById(venue.sellerId).select("fullName name email");
    return { vendorId: venue.sellerId, vendorName: provider?.fullName || provider?.name || venue.name || "Venue provider", vendorType: "venue" };
  }
  // Platform-owned venues have no external vendor; the admin receives the
  // venue share so the money is still attributed correctly.
  const admin = await User.findOne({ role: "admin" }).select("fullName name email").sort({ createdAt: 1 });
  if (!admin) return null;
  return { vendorId: admin._id, vendorName: admin.fullName || admin.name || "Bandhan Admin", vendorType: "venue" };
}

router.post("/booking/create-order", auth, requireRole(...customerRoles), async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ success: false, message: "Payment service not configured" });
    const booking = await Booking.findOne({ _id: req.body.bookingId, userId: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (["paid", "refunded"].includes(String(booking.paymentStatus))) {
      return res.status(409).json({ success: false, message: "This booking is already paid" });
    }
    if (["cancelled"].includes(String(booking.status))) {
      return res.status(409).json({ success: false, message: "This booking was cancelled" });
    }
    const provider = await resolveBookingProvider(booking);
    if (!provider) {
      return res.status(409).json({ success: false, message: "This listing has no payment provider assigned" });
    }
    const amount = Number(booking.pricing?.total || 0);
    if (!(amount > 0)) return res.status(400).json({ success: false, message: "Booking has no payable amount" });

    const receipt = `booking_${String(booking._id).slice(-8)}_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
    });
    await Payment.create({
      userId: req.user.id,
      paymentFor: "booking",
      subtotal: Number(booking.pricing?.subtotal || 0),
      platformFee: Number(booking.pricing?.serviceFee || 0),
      gst: Number(booking.pricing?.tax || 0),
      totalAmount: amount,
      currency: "INR",
      paymentMethod: ["card", "upi", "wallet", "netbanking", "emi"].includes(req.body.paymentMethod)
        ? req.body.paymentMethod
        : "pending",
      orderId: order.id,
      receipt: order.receipt || receipt,
      status: "pending",
      metadata: {
        bookingId: String(booking._id),
        bookingType: booking.bookingType,
        vendorId: String(provider.vendorId),
        vendorType: provider.vendorType,
        vendorName: provider.vendorName,
        pricing: booking.pricing,
      },
    });
    return res.json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency, receipt: order.receipt },
      quote: booking.pricing,
    });
  } catch (error) {
    console.error("Booking payment order creation failed:", error);
    return res.status(500).json({ success: false, message: "Unable to create booking payment order" });
  }
});

router.post("/booking/verify", auth, requireRole(...customerRoles), async (req, res) => {
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
      paymentFor: "booking",
    });
    if (!payment) return res.status(404).json({ success: false, message: "Booking payment order not found" });
    if (payment.status === "completed" && payment.transactionId === razorpay_payment_id) {
      return res.json({ success: true, message: "Payment already verified", paymentId: String(payment._id) });
    }
    if (!signatureIsValid(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    payment.transactionId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = "completed";
    payment.paidAt = new Date();
    await payment.save();

    const booking = await Booking.findOne({ _id: payment.metadata?.bookingId, userId: req.user.id });
    if (booking) {
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      await booking.save();
      await recordBookingEarnings({ payment, booking });
    }
    return res.json({ success: true, message: "Booking payment verified", paymentId: String(payment._id) });
  } catch (error) {
    console.error("Booking payment verification failed:", error);
    return res.status(500).json({ success: false, message: "Booking payment verification failed" });
  }
});

module.exports = router;
