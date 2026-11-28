const mongoose = require("mongoose");

const vendorAvailabilitySchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, trim: true },
    slots: [
      {
        start: { type: String, default: "", trim: true },
        end: { type: String, default: "", trim: true },
        isBlocked: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

vendorAvailabilitySchema.index({ sellerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("VendorAvailability", vendorAvailabilitySchema);
