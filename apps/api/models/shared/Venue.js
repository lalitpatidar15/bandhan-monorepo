const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  sellerEmail: { type: String, lowercase: true, trim: true },
  name: String,
  venueType: { type: String, default: "event_space" },
  location: String,
  rating: Number,
  reviews: Number,
  guests: Number,
  minGuests: { type: Number, default: 0 },
  maxGuests: { type: Number, default: 0 },
  address: String,
  gps: { latitude: Number, longitude: Number },

  images: [String],

  description: String,
  video: String,
  virtualTourUrl: String,
  facilities: { type: [String], default: [] },
  spaces: [{ name: String, capacity: Number, pricePerDay: Number, images: [String], facilities: [String], availability: [{ date: Date, status: String }] }],
  packages: [{ name: String, description: String, price: Number, inclusions: [String], minGuests: Number }],

  pricePerDay: Number,
  pricePerHour: Number,
  depositAmount: { type: Number, default: 0 },
  weekendPrice: Number,
  seasonalPricing: [{ name: String, startDate: Date, endDate: Date, pricePerDay: Number }],
  serviceFee: Number,

  availability: [
    {
      date: Date,
      status: { type: String, enum: ["available", "reserved", "booked", "blocked", "maintenance"] }
    }
  ],
  status: { type: String, enum: ["draft", "active", "inactive"], default: "draft" },
  isApproved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Venue", venueSchema);
