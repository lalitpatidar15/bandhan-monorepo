const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    daysToGo: { type: Number, min: 0 },
    guestCount: { type: Number, min: 0, default: 0 },
    eventType: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["planning", "confirmed", "completed", "cancelled"],
      default: "planning",
    },

    phases: [
      {
        name: { type: String, required: true, trim: true },
        status: { type: String, default: "Not started" },
        progress: { type: Number, min: 0, max: 100, default: 0 },
      },
    ],

    tasks: [
      {
        title: { type: String, required: true, trim: true },
        priority: { type: String, default: "Medium" },
        status: { type: String, default: "pending" },
        vendor: { type: String, default: "" },
        phase: { type: String, default: "" },
      },
    ],

    budget: {
      total: { type: Number, min: 0, default: 0 },
      spent: { type: Number, min: 0, default: 0 },
      vendorPaid: { type: Number, min: 0, default: 0 },
      pending: { type: Number, default: 0 },
      allocated: { type: Map, of: Number, default: {} },
      spentByCategory: { type: Map, of: Number, default: {} },
    },

    guests: {
      accepted: { type: Number, min: 0, default: 0 },
      pending: { type: Number, min: 0, default: 0 },
      vip: { type: Number, min: 0, default: 0 },
    },

    vendors: [
      {
        vendorId: { type: String, default: "" },
        name: { type: String, default: "", trim: true },
        category: { type: String, default: "", trim: true },
        status: { type: String, default: "pending" },
      },
    ],

    venues: [
      {
        venueId: { type: String, default: "" },
        name: { type: String, default: "", trim: true },
        location: { type: String, default: "", trim: true },
        status: { type: String, default: "pending" },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, flattenMaps: true },
    toObject: { virtuals: true, flattenMaps: true },
  }
);

eventSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);
