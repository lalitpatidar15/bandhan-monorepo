const mongoose = require("mongoose");

const PAYMENT_STATUSES = ["pending", "authorized", "paid", "failed", "refunded", "partially_refunded"];
const ORDER_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

function normalizePaymentStatus(value) {
  if (typeof value !== "string") return "pending";

  const normalized = value.trim().toLowerCase();

  if (normalized === "partial") {
    return "partially_refunded";
  }

  return PAYMENT_STATUSES.includes(normalized) ? normalized : "pending";
}

function normalizeOrderStatus(value) {
  if (typeof value !== "string") return "pending";

  const normalized = value.trim().toLowerCase();
  return ORDER_STATUSES.includes(normalized) ? normalized : "pending";
}

const itemSubSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.Mixed, ref: "Product" },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  itemType: { type: String, default: "product" },
  title: String,
  image: String,
  customerName: String,
  price: Number,
  quantity: Number,
  variant: String,
  rentalStart: Date,
  rentalEnd: Date,
  serviceDate: Date,
  serviceGuests: Number,
}, { _id: false });

const shipmentDetailsSchema = new mongoose.Schema({
  shiprocketOrderId: String,
  shipmentId: String,
  awbCode: String,
  courierName: String,
  pickupScheduledDate: String,
  trackingUrl: String,
  status: { type: String, default: "NOT_SHIPPED" },
  partner: { type: String, default: "Shiprocket" },
  trackingStatus: String,
  createdAt: { type: Date, default: Date.now },
  meta: { type: Object, default: {} },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    customerName: String,
    customerEmail: String,
    sellerName: String,
    sellerEmail: String,

    items: [itemSubSchema],

    service: String,

    amount: Number,

    orderId: String,

    productName: String,

    eventDate: Date,

    shippingAddress: {
      name: String,
      fullName: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },

    paymentMethod: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,

    shipmentDetails: {
      type: shipmentDetailsSchema,
      default: { status: "NOT_SHIPPED" },
    },

    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
      set: normalizePaymentStatus
    },

    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      set: normalizeOrderStatus
    },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      set: normalizeOrderStatus
    }

  },
  { timestamps: true }
);

orderSchema.pre("validate", function syncOrderStatuses(next) {
  this.paymentStatus = normalizePaymentStatus(this.paymentStatus);

  const normalizedOrderStatus = normalizeOrderStatus(this.orderStatus || this.status);
  this.orderStatus = normalizedOrderStatus;
  this.status = normalizedOrderStatus;

  if (!this.shipmentDetails || typeof this.shipmentDetails !== "object") {
    this.shipmentDetails = { status: "NOT_SHIPPED" };
  } else if (!this.shipmentDetails.status) {
    this.shipmentDetails.status = "NOT_SHIPPED";
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);