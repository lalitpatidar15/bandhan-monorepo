const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "", trim: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["draft", "active"],
      default: "active",
    },
  },
  { timestamps: true }
);

communitySchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Community", communitySchema);
