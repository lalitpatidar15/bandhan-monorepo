const mongoose = require("mongoose");

const ticketUpdateSchema = new mongoose.Schema(
  {
    status: { type: String },
    note: { type: String, trim: true },
    actor: { type: String, trim: true, default: "user" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const customerTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    orderId: { type: String, trim: true },
    status: { type: String, enum: ["open", "in_progress", "waiting_user", "closed"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    updates: { type: [ticketUpdateSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerTicket", customerTicketSchema);
