const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    profilePhoto: String,

    fullName: String,

    email: String,

    phone: String,

    displayName: String,

    legalEntityName: String,

    gstNumber: String,

    address: String,

    storeCategories: [String],

    verifiedSeller: {
      type: Boolean,
      default: false
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false
    },

    orderAlerts: {
      type: Boolean,
      default: true
    },

    stockUpdates: {
      type: Boolean,
      default: true
    },

    marketingEmails: {
      type: Boolean,
      default: false
    },

    fulfillmentRate: {
      type: Number,
      default: 0
    },

    responseTime: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Merchant",
  merchantSchema
);