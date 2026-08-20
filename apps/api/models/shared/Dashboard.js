const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema({
  userId: String,
  upcomingEvents: Number,
  activeBookings: Number,
  pendingQuotes: Number,
  budgetUsage: Number,

  events: [
    {
      title: String,
      date: String,
      progress: Number,
      image: String
    }
  ],

  orders: [
    {
      title: String,
      price: Number,
      status: String
    }
  ],

  rentals: [
    {
      item: String,
      status: String,
      returnDate: String
    }
  ],

  guestSummary: {
    accepted: Number,
    pending: Number,
    declined: Number
  }
});

module.exports = mongoose.model("Dashboard", dashboardSchema);