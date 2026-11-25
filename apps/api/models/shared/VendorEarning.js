const mongoose = require("mongoose");

// A derived ledger record: one vendor's share of one actual captured payment.
// It is written only from completed Payment/Order or Payment/Booking data —
// never from client-supplied amounts or manually entered settlements.
const vendorEarningSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorType: { type: String, enum: ["product", "service", "venue"], required: true },
    vendorName: { type: String, trim: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    razorpayPaymentId: { type: String },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    currency: { type: String, default: "INR" },
    grossAmount: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, required: true, min: 0, max: 1 },
    commission: { type: Number, required: true, min: 0 },
    shippingPassThrough: { type: Number, default: 0, min: 0 },
    taxPassThrough: { type: Number, default: 0, min: 0 },
    platformServiceFeeShare: { type: Number, default: 0, min: 0 },
    netPayable: { type: Number, required: true, min: 0 },
    refundedAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["pending", "paid", "partially_refunded", "refunded"], default: "pending" },
    paidAt: { type: Date },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

vendorEarningSchema.index(
  { paymentId: 1, orderId: 1, bookingId: 1, vendorId: 1, vendorType: 1 },
  { unique: true, partialFilterExpression: { paymentId: { $exists: true } } }
);
vendorEarningSchema.index({ vendorId: 1, status: 1 });
vendorEarningSchema.index({ vendorType: 1, createdAt: -1 });

module.exports = mongoose.model("VendorEarning", vendorEarningSchema);
