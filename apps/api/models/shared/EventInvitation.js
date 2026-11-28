const mongoose = require("mongoose");

const eventInvitationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: "EventGuest" },
    channel: { type: String, enum: ["link", "email", "sms"], default: "link" },
    status: { type: String, enum: ["draft", "link_ready", "sent", "failed"], default: "draft" },
    token: { type: String, unique: true, sparse: true },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventInvitation", eventInvitationSchema);
