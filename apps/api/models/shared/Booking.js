const mongoose = require("mongoose");

const PAYMENT_STATUSES = ["pending", "authorized", "paid", "failed", "refunded", "partially_refunded"];

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  bookingType: {
    type: String,
    enum: ["service", "venue"],
    default: "service",
  },

  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
  },

  eventDate: Date,
  guestCount: Number,
  eventType: String,
  startTime: String,
  endTime: String,
  packageId: String,
  requirements: String,
  contactPerson: String,
  alternateMobile: String,
  roomsRequired: String,

  items: [
    {
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
      providerId: String,
      title: String,
      image: String,
      priceAtTime: Number,
      quantity: Number,
    },
  ],

  address: {
    fullAddress: String,
    city: String,
    pincode: String,
  },

  paymentMethod: {
    type: String,
    enum: ["card", "upi", "wallet"],
  },

  paymentStatus: {
    type: String,
    enum: PAYMENT_STATUSES,
    default: "pending",
  },

  pricing: {
    subtotal: Number,
    serviceFee: Number,
    tax: Number,
    total: Number,
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
    default: "pending",
  },

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
