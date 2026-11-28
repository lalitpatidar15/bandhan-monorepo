const mongoose = require("mongoose");

const eventCollaboratorSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, default: "", trim: true, lowercase: true },
    role: { type: String, enum: ["editor", "viewer", "vendor"], default: "editor" },
    permissions: { type: [String], default: [] },
    status: { type: String, enum: ["invited", "accepted", "declined"], default: "invited" },
    token: { type: String, unique: true, sparse: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventCollaborator", eventCollaboratorSchema);
