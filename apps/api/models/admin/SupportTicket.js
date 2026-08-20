const mongoose = require("mongoose");

const ticketUpdateSchema = new mongoose.Schema(
  {
    status: { type: String },
    note: { type: String, trim: true },
    actor: { type: String, trim: true, default: "admin" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const supportTicketSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "in_progress", "waiting_user", "closed"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    requester: { type: String, required: true, trim: true },
    assignedTo: { type: String, trim: true, default: "" },
    updates: { type: [ticketUpdateSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
