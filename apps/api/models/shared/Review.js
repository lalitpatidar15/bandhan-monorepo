const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    customerName: {
      type: String,
      default: "Anonymous",
    },

    customerEmail: {
      type: String,
      default: "",
    },

    sellerName: {
      type: String,
      default: "",
    },

    sellerEmail: {
      type: String,
      default: "",
    },

    customerImage: {
      type: String,
      default: "",
    },

    productName: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    comment: {
      type: String,
      default: "",
    },

    review: {
      type: String,
    },

    sellerReply: {
      type: String,
      default: "",
    },

    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } });

module.exports = mongoose.model("Review", reviewSchema);
