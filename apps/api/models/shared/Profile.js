const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // ===== BASIC PROFILE =====
    profilePhoto: String,

    coverPhoto: String,

    fullName: String,

    username: String,

    displayName: String,

    bio: String,

    gender: String,

    dateOfBirth: String,

    contactNumber: String,

    alternateNumber: String,

    address: String,

    city: String,

    state: String,

    country: String,

    pincode: String,


    // ===== BUSINESS DETAILS =====
    businessName: String,

    gstNumber: String,

    businessCategory: String,

    businessAddress: String,

    website: String,

    experience: String,


    // ===== SOCIAL LINKS =====
    linkedinUrl: String,

    githubUrl: String,

    twitterUrl: String,

    portfolioUrl: String,


    // ===== VERIFICATION =====
    governmentId: String,

    aadhaarNumber: String,

    panNumber: String,

    isVerified: {
      type: Boolean,
      default: false
    },


    // ===== ONBOARDING =====
    onboardingStep: {
      type: Number,
      default: 1
    },

    profileCompleted: {
      type: Boolean,
      default: false
    },


    // ===== SETTINGS PAGE =====
    email: String,

    password: String,

    darkMode: {
      type: Boolean,
      default: false
    },

    emailNotifications: {
      type: Boolean,
      default: true
    },

    courseReminders: {
      type: Boolean,
      default: true
    },

    smsNotifications: {
      type: Boolean,
      default: false
    },

    languagePreference: {
      type: String,
      default: "English"
    },

    interests: [String],

    skills: [String],


    // ===== PAYMENT INFO =====
    cardNumber: String,

    cardHolderName: String,

    expiryDate: String,

    cvv: String,

    upiId: String,

    bankName: String,

    twoFactorEnabled: {
      type: Boolean,
      default: false
    },

    accountNumber: String,

    ifscCode: String,

    paymentMethods: [{
      id: Number,
      type: String,
      title: String,
      subtitle: String
    }],


    // ===== LEARNING INFO =====
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ],

    completedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ],

    certificates: [
      {
        courseName: String,
        certificateUrl: String
      }
    ],


    // ===== STATUS =====
    isActive: {
      type: Boolean,
      default: true
    }

  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Profile", profileSchema);