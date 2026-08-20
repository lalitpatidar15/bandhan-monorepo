const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    commissionDeducted: {
      type: Number,
      default: 0,
    },
    netPayable: {
      type: Number,
      default: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    rentalIncome: {
      type: Number,
      default: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    adjustment: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "upi", "manual"],
      default: "bank_transfer",
    },
    transactionId: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

settlementSchema.index({ sellerId: 1, period: 1 });
settlementSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Settlement", settlementSchema);
