const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    transactionId: {
      type: String,
      required: true
    },

    orderId: String,

    serviceName: String,

    customerName: String,

    amount: {
      type: Number,
      required: true
    },

    commission: {
      type: Number,
      required: true
    },

    net: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Paid"],
      default: "Pending"
    },

    transactionDate: {
      type: Date,
      default: Date.now
    },

    gst: {
      type: Number,
      default: 0
    },

    paymentGatewayFee: {
      type: Number,
      default: 0
    },

    discounts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Earning", earningSchema);