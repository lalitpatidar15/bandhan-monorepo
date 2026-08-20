const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    requestId: {
      type: String,
      required: true
    },

    customerName: String,

    orderId: String,

    productName: String,

    sku: String,

    type: {
      type: String,
      enum: ["Product", "Service", "Rental"],
      default: "Product"
    },

    requestKind: {
      type: String,
      enum: ["cancel", "return"],
      default: "return"
    },

    reason: String,

    amount: Number,

    requestDate: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Refunded"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Return", returnSchema);
