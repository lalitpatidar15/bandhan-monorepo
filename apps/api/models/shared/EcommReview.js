const mongoose = require("mongoose");

const ecommReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  itemType: { type: String, enum: ["venue", "vendor", "service", "product"], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, default: "" },
  comment: { type: String, required: true },
  image: { type: String, default: "" },
  sellerReply: { type: String, default: "" },
  repliedAt: Date
}, { timestamps: true });

ecommReviewSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });

module.exports = mongoose.model("EcommReview", ecommReviewSchema);
