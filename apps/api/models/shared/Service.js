const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  pricingModel: { type: String, enum: ["fixed", "hourly", "per_person", "per_session", "quote"], default: "fixed" },
  durationMinutes: { type: Number, default: 60 },
  serviceArea: { type: [String], default: [] },
  availableDays: { type: [String], default: [] },
  timeSlots: [{ startTime: String, endTime: String, capacity: { type: Number, default: 1 } }],
  bufferMinutes: { type: Number, default: 0 },
  maxBookingsPerSlot: { type: Number, default: 1 },
  addons: [{ name: String, price: Number, durationMinutes: Number }],
  providers: [{ name: String, photo: String, skills: [String], experienceYears: Number, workingHours: String, isActive: { type: Boolean, default: true } }],
  eventType: {
    type: [String],
    default: [],
    set: (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
      if (typeof value === "string") {
        return value
          .split(",")
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
      return [];
    },
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  minGuests: {
    type: Number,
    default: 0,
  },
  maxGuests: {
    type: Number,
    default: 0,
  },
  guests: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  image: {
    type: String,
    trim: true,
    default: "",
  },
  images: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["active", "draft"],
    default: "active",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
