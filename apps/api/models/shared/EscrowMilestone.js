const mongoose = require("mongoose");

const escrowMilestoneSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    vendorId: { type: String, default: "", trim: true },
    vendorName: { type: String, default: "", trim: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "paid", "released", "cancelled"], default: "pending" },
    dueDate: { type: Date },
    paymentRef: { type: String, default: "", trim: true },
    proofUrl: { type: String, default: "", trim: true },
    releasedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EscrowMilestone", escrowMilestoneSchema);
