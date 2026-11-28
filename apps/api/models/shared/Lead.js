const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    eventType: { type: String, default: "", trim: true },
    eventDate: { type: String, default: "", trim: true },
    budget: { type: Number, default: 0 },
    source: { type: String, default: "", trim: true },
    status: { type: String, enum: ["new", "contacted", "qualified", "converted", "lost"], default: "new" },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
