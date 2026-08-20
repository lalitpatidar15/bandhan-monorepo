const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: { type: String, select: false },


  fullName: String,
  phone: String,
  address: { type: String, default: "", trim: true },
  profilePic: String,
  preferences: {
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
  },

  eventDetails: {
    eventType: String,
    eventDate: String, 
    location: String,
    guestCount: String,
  },

  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  profileImage: {
  type: String,
 },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  socialProvider: {
     type: String,
     enum: ["google", "facebook", null],
     default: null
   },
   socialId: {
     type: String,
     default: ""
   },
  otpCodeHash: {
    type: String,
    default: ""
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  otpPurpose: {
    type: String,
    default: ""
  },
 role: {
    type: String,
    enum: ["admin", "buyer", "seller", "eventOwner", "learner", "jobSeeker"],
    default: "buyer"
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
   onboardingStep: {
    type: Number,
    default: 1
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
