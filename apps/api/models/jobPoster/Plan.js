const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  duration: {
    type: Number,
    required: true,
    default: 30
  },
  description: {
    type: String,
    default: ""
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Plan", planSchema);
