const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    entityType: { type: String, enum: ["general", "product", "service", "venue", "vendor"], default: "general" },
    entityId: { type: String, trim: true },
    title: { type: String, trim: true },
    requiredDate: Date,
    budget: { type: Number, min: 0 },
    guestCount: { type: Number, min: 0 },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["new", "contacted", "resolved"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
