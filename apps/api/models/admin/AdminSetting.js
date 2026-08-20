const mongoose = require("mongoose");

const adminSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "platform" },
    platformName: { type: String, default: "Bandhan" },
    supportEmail: { type: String, default: "support@bandhan.com" },
    supportPhone: { type: String, default: "+91-9999-999-999" },
    maxUploadSize: { type: Number, default: 50 },
    maintenanceMode: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: false },
    apiRateLimit: { type: Number, default: 1000 },
    jobPostingFee: { type: Number, default: 499 },
    serviceFee: { type: Number, default: 150 },
    taxRate: { type: Number, default: 0.08 },
    platformFee: { type: Number, default: 50 },
    gstRate: { type: Number, default: 0.18 },
    defaultCurrency: { type: String, default: "INR" },
    jwtExpiry: { type: String, default: "7d" },
    otpExpiryMinutes: { type: Number, default: 10 },
    paginationLimit: { type: Number, default: 12 },
    rentalReturnWindowHours: { type: Number, default: 24 },
    defaultReturnPolicy: { type: String, default: "7-day return policy" },
    catalogFilters: {
      sortOptions: {
        type: [
          {
            value: { type: String, required: true },
            label: { type: String, required: true },
          },
        ],
        default: [
          { value: "recommended", label: "Recommended" },
          { value: "price-low", label: "Price: Low to High" },
          { value: "price-high", label: "Price: High to Low" },
          { value: "rating", label: "Rating" },
        ],
      },
      productModes: {
        type: [String],
        default: ["buy", "rent"],
      },
      venueTypes: {
        type: [String],
        default: [],
      },
      serviceTypes: {
        type: [String],
        default: [],
      },
      ratingSteps: {
        type: [Number],
        default: [3, 4, 4.5],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminSetting", adminSettingSchema);
