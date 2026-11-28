const mongoose = require("mongoose");

const servicePackageSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, default: 0 },
    billingCycle: { type: String, enum: ["one_time", "monthly", "seasonal"], default: "one_time" },
    inclusions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServicePackage", servicePackageSchema);
