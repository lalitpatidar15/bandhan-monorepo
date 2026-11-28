const mongoose = require("mongoose");

const eventDayIssueSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    type: { type: String, enum: ["vendor_arrival", "issue", "emergency", "task"], default: "issue" },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: String, default: "", trim: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventDayIssue", eventDayIssueSchema);
