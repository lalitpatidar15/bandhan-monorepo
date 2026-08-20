const mongoose = require("mongoose");

const RENTAL_STATUSES = [
  "pending_deposit",
  "deposit_paid",
  "reserved",
  "shipped",
  "delivered",
  "in_use",
  "return_scheduled",
  "return_shipped",
  "returned",
  "inspection",
  "completed",
  "cancelled",
  "overdue",
];

const RETURN_CONDITIONS = ["excellent", "good", "fair", "poor", "damaged"];

const rentalOrderSchema = new mongoose.Schema(
  {
    rentalId: {
      type: String,
      unique: true,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productTitle: {
      type: String,
      required: true,
    },

    productImage: String,

    variantName: String,

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    rentalStart: {
      type: Date,
      required: true,
    },

    rentalEnd: {
      type: Date,
      required: true,
    },

    actualReturnDate: Date,

    rentalDurationDays: {
      type: Number,
      required: true,
    },

    dailyRate: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    securityDeposit: {
      type: Number,
      default: 0,
    },

    lateFee: {
      type: Number,
      default: 0,
    },

    damageFee: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    depositRefundAmount: {
      type: Number,
      default: 0,
    },

    lateFeePerDay: {
      type: Number,
      default: 0,
    },

    lateReturnFee: {
      type: Number,
      default: 0,
    },

    maxExtensionDays: {
      type: Number,
      default: 7,
    },

    extensionDays: {
      type: Number,
      default: 0,
    },

    extensionFee: {
      type: Number,
      default: 0,
    },

    paymentId: String,

    razorpayOrderId: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "deposit_paid", "full_paid", "partial_refund", "full_refund", "failed"],
      default: "pending",
    },

    depositPaymentId: String,

    depositRefundPaymentId: String,

    rentalStatus: {
      type: String,
      enum: RENTAL_STATUSES,
      default: "pending_deposit",
    },

    shippingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    shippingMethod: {
      type: String,
      enum: ["standard", "express", "self_pickup"],
      default: "standard",
    },

    trackingNumber: String,

    shippedAt: Date,

    deliveredAt: Date,

    returnWindow: {
      type: Date,
    },

    returnInitiatedAt: Date,

    returnTrackingNumber: String,

    returnShippedAt: Date,

    returnReceivedAt: Date,

    inspectionDate: Date,

    inspectionNotes: String,

    returnCondition: {
      type: String,
      enum: RETURN_CONDITIONS,
    },

    damageReported: {
      type: Boolean,
      default: false,
    },

    damageDescription: String,

    damagePhotos: [String],

    extensionRequests: [
      {
        requestedAt: Date,
        newEndDate: Date,
        additionalDays: Number,
        additionalFee: Number,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
      },
    ],

    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        sentAt: { type: Date, default: Date.now },
      },
    ],

    adminNotes: String,

    sellerNotes: String,

    cancellationReason: String,

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancelledAt: Date,

    completedAt: Date,
  },
  { timestamps: true }
);

rentalOrderSchema.pre("validate", function generateRentalId(next) {
  if (!this.rentalId) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.rentalId = `RN-${ts}-${rand}`;
  }
  next();
});

rentalOrderSchema.pre("validate", function computeDatesAndTotals(next) {
  if (this.rentalStart && this.rentalEnd) {
    const diffMs = new Date(this.rentalEnd).getTime() - new Date(this.rentalStart).getTime();
    this.rentalDurationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  if (this.rentalDurationDays && this.dailyRate) {
    this.subtotal = this.rentalDurationDays * this.dailyRate * (this.quantity || 1);
  }

  let total = this.subtotal || 0;
  total += this.securityDeposit || 0;
  total += this.lateFee || 0;
  total += this.damageFee || 0;
  total += this.extensionFee || 0;
  this.totalAmount = total;

  if (this.rentalEnd) {
    this.returnWindow = new Date(new Date(this.rentalEnd).getTime() + 24 * 60 * 60 * 1000);
  }

  next();
});

rentalOrderSchema.methods.calculateLateFee = function () {
  if (!this.actualReturnDate || !this.rentalEnd) return 0;
  const lateDays = Math.max(
    0,
    Math.ceil(
      (new Date(this.actualReturnDate).getTime() - new Date(this.returnWindow || this.rentalEnd).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
  return lateDays * (this.lateFeePerDay || this.lateReturnFee || 0);
};

rentalOrderSchema.methods.approveExtension = function (requestIndex) {
  const req = this.extensionRequests[requestIndex];
  if (!req || req.status !== "pending") return false;
  req.status = "approved";
  req.approvedBy = this.sellerId;
  this.rentalEnd = new Date(req.newEndDate);
  this.extensionDays += req.additionalDays;
  this.extensionFee += req.additionalFee;
  return true;
};

rentalOrderSchema.methods.rejectExtension = function (requestIndex) {
  const req = this.extensionRequests[requestIndex];
  if (!req || req.status !== "pending") return false;
  req.status = "rejected";
  return true;
};

rentalOrderSchema.index({ rentalStatus: 1 });
rentalOrderSchema.index({ rentalEnd: 1 });
rentalOrderSchema.index({ userId: 1, rentalStatus: 1 });
rentalOrderSchema.index({ sellerId: 1, rentalStatus: 1 });

module.exports = mongoose.model("RentalOrder", rentalOrderSchema);
