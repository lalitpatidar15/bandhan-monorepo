const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [(val) => Array.isArray(val) && val.length === 2, "Participants must contain buyer and seller"],
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerName: {
      type: String,
      trim: true,
    },
    sellerName: {
      type: String,
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      default: null,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    rentalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalOrder",
      default: null,
    },
    productName: {
      type: String,
      trim: true,
    },
    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
      default: null,
    },
    quoteStatus: {
      type: String,
      trim: true,
      lowercase: true,
      default: "pending",
    },
    status: {
      type: String,
      trim: true,
      lowercase: true,
      default: "pending",
    },
    quoteEventDate: {
      type: String,
      trim: true,
    },
    quoteGuestRange: {
      type: String,
      trim: true,
    },
    quoteBudget: {
      type: Number,
      default: 0,
    },
    quoteServices: {
      type: [String],
      default: [],
    },
    quoteNote: {
      type: String,
      trim: true,
    },
    quoteFullName: {
      type: String,
      trim: true,
    },
    quotePhone: {
      type: String,
      trim: true,
    },
    quoteEmail: {
      type: String,
      trim: true,
    },
    quoteListingType: {
      type: String,
      trim: true,
      default: "",
    },
    serviceName: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    orderStatus: {
      type: String,
      trim: true,
    },
    shippingAddress: {
      type: Object,
      default: {},
    },
    productImage: {
      type: String,
      trim: true,
    },
    serviceImage: {
      type: String,
      trim: true,
    },
    orderNumber: {
      type: String,
      trim: true,
    },
    lastMessage: {
      type: String,
      trim: true,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    unreadCountBuyer: {
      type: Number,
      default: 0,
    },
    unreadCountSeller: {
      type: Number,
      default: 0,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);
