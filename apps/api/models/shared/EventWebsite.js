const mongoose = require("mongoose");

const eventWebsiteSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, default: "", trim: true },
    theme: { type: String, default: "classic", trim: true },
    coverImage: { type: String, default: "", trim: true },
    story: { type: String, default: "", trim: true },
    venueDetails: { type: String, default: "", trim: true },
    schedule: [
      {
        time: { type: String, default: "", trim: true },
        title: { type: String, default: "", trim: true },
        description: { type: String, default: "", trim: true },
      },
    ],
    rsvpEnabled: { type: Boolean, default: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventWebsite", eventWebsiteSchema);
