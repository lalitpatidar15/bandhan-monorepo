const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      itemType: { type: String, enum: ["service", "product", "venue"], default: "service" },
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue" },

      title: String,
      image: String,

      priceAtTime: Number, 

      quantity: Number,

      eventDate: Date,
      guests: Number,
      packageType: String,

      variant: String,
      rentalDays: Number,
      bookingDate: Date,
      startTime: String,
      endTime: String,
      guestCount: Number,
    }
  ]
});

module.exports = mongoose.model("Cart", cartSchema);
