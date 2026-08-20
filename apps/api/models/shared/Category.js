const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    subcategories: { type: [String], default: [] },
    scopes: {
      type: [String],
      enum: ["products", "services", "venues", "courses", "jobs"],
      default: ["products"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
