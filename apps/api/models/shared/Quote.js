// models/Quote.js
const mongoose = require("mongoose");

function normalizeListingType(value) {
  const normalized = String(value || "service").trim().toLowerCase();
  return {
    venues: "venue",
    products: "product",
    services: "service",
  }[normalized] || normalized;
}

const quoteSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

  listingType: {
    type: String,
    required: true,
    enum: ["service", "venue", "product"],
    lowercase: true,
    set: normalizeListingType,
    default: "service",
  },

  eventType: String,
  eventDate: String,
  location: String,

  guestRange: {
    type: String, 
  },

  services: [
    {
      type: String, 
    }
  ],

  budget: Number,
  isBudgetFlexible: {
    type: Boolean,
    default: false,
  },

  note: String,

  fullName: String,
  phone: String,
  email: String,

  title: String,
  price: Number,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "replied"],
    default: "pending",
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Quote", quoteSchema);
