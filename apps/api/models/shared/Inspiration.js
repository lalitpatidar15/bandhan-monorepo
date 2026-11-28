const mongoose = require("mongoose");

const inspirationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    images: [String],
    description: { type: String, default: "" },
    tags: [String],
    isActive: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

inspirationSchema.index({ category: 1, publishedAt: -1 });

module.exports = mongoose.model("Inspiration", inspirationSchema);
