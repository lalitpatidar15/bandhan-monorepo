const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"   
  },
  sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    message: String

}, 
{ timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);