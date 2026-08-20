const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  title: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  rating: Number,
  totalReviews: Number,

  eventType: String,
  serviceTier: String,

  images: [String],

  description: String,
  highlights: [String],

  vendor: {
    name: String,
    experience: String,
    rating: Number
  },

  reviews: [
    {
      name: String,
      rating: Number,
      comment: String,
      images: [String]
    }
  ],
  faq: [
    {
      question: String,
      answer: String
    }
  ],

  relatedPackages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package"
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Package", packageSchema);