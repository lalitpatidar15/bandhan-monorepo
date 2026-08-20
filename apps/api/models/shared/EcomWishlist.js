const mongoose = require("mongoose");

const ecomWishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityType: {
    type: String,
    enum: ["product", "service", "venue"],
    required: true
  },
  title: String,
  image: String,
  price: Number
}, {
  timestamps: true
});

ecomWishlistSchema.index({ userId: 1, entityId: 1, entityType: 1 }, { unique: true });

module.exports = mongoose.model("EcomWishlist", ecomWishlistSchema);
