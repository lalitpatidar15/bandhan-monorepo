const mongoose = require("mongoose");

const disputeUpdateSchema = new mongoose.Schema(
  {
    status: { type: String },
    resolution: { type: String, trim: true },
    actor: { type: String, trim: true, default: "admin" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const disputeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, default: "general" },
    status: { type: String, enum: ["open", "in_review", "resolved", "rejected"], default: "open" },
    raisedBy: { type: String, default: "unknown" },
    referenceId: { type: String, default: "" },
    resolution: { type: String, default: "" },
    updates: { type: [disputeUpdateSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dispute", disputeSchema);
