const AdminSetting = require("../models/admin/AdminSetting.js");

let cachedSettings = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000;

const DEFAULTS = {
  platformName: "Bandhan",
  supportEmail: "support@bandhan.com",
  supportPhone: "+91-9999-999-999",
  maxUploadSize: 50,
  maintenanceMode: false,
  emailNotifications: true,
  twoFactorAuth: false,
  apiRateLimit: 1000,
  jobPostingFee: 499,
  serviceFee: 150,
  taxRate: 0.08,
  platformFee: 50,
  gstRate: 0.18,
  defaultCurrency: "INR",
  jwtExpiry: "7d",
  otpExpiryMinutes: 10,
  paginationLimit: 12,
  rentalReturnWindowHours: 24,
  defaultReturnPolicy: "7-day return policy",
};

async function getSettings() {
  const now = Date.now();
  if (cachedSettings && now - lastFetch < CACHE_TTL) {
    return cachedSettings;
  }

  let settings = await AdminSetting.findOne({ key: "platform" });
  if (!settings) {
    settings = await AdminSetting.create({ key: "platform" });
  }

  const raw = settings.toObject ? settings.toObject() : settings;
  cachedSettings = { ...DEFAULTS, ...raw };
  lastFetch = now;
  return cachedSettings;
}

function invalidateCache() {
  cachedSettings = null;
  lastFetch = 0;
}

async function getSetting(key) {
  const settings = await getSettings();
  return settings[key] !== undefined ? settings[key] : DEFAULTS[key];
}

module.exports = { getSettings, getSetting, invalidateCache };
