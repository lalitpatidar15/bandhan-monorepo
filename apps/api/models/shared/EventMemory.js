const mongoose = require("mongoose");

const eventMemorySchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    images: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    memoryDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventMemory", eventMemorySchema);
