const mongoose = require("mongoose");

const eventTableSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, default: 8 },
    guests: [{ type: mongoose.Schema.Types.ObjectId, ref: "EventGuest" }],
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventTable", eventTableSchema);
