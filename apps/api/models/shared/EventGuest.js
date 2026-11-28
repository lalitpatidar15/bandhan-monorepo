const mongoose = require("mongoose");

const eventGuestSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    plusOne: { type: Boolean, default: false },
    mealPreference: { type: String, default: "", trim: true },
    rsvpStatus: {
      type: String,
      enum: ["invited", "attending", "declined", "maybe"],
      default: "invited",
    },
    invitationToken: { type: String, unique: true, sparse: true },
    checkedInAt: { type: Date },
    tableId: { type: String, default: "" },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventGuest", eventGuestSchema);
