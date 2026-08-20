const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    unique: true,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userDetails: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    type: {
      type: String,
      enum: ["buy", "rent", "service", "venue"]
    }
  }],
  subtotal: Number,
  shipping: Number,
  serviceFee: Number,
  tax: Number,
  discount: Number,
  total: Number,
  paymentMethod: String,
  transactionId: String,
  paymentStatus: {
    type: String,
    enum: ["paid", "refunded", "partial_refund"],
    default: "paid"
  },
  invoiceUrl: String,
  status: {
    type: String,
    enum: ["paid", "refunded", "partial_refund"],
    default: "paid"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Invoice", invoiceSchema);
