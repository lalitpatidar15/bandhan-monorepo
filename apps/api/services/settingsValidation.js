const EDITABLE_SETTING_KEYS = new Set([
  "platformName", "supportEmail", "supportPhone", "maxUploadSize", "maintenanceMode",
  "emailNotifications", "twoFactorAuth", "apiRateLimit", "jobPostingFee", "serviceFee",
  "taxRate", "platformFee", "gstRate", "defaultCurrency", "jwtExpiry", "otpExpiryMinutes",
  "paginationLimit", "rentalReturnWindowHours", "defaultReturnPolicy", "catalogFilters",
]);

const NON_NEGATIVE_NUMBERS = new Set([
  "maxUploadSize", "apiRateLimit", "jobPostingFee", "serviceFee", "taxRate", "platformFee",
  "gstRate", "otpExpiryMinutes", "paginationLimit", "rentalReturnWindowHours",
]);

function pickAndValidateSettings(input = {}) {
  const changes = {};
  for (const [key, value] of Object.entries(input)) {
    if (!EDITABLE_SETTING_KEYS.has(key)) continue;
    if (NON_NEGATIVE_NUMBERS.has(key)) {
      if (!Number.isFinite(value) || value < 0) throw new Error(`${key} must be a non-negative number`);
      if (["taxRate", "gstRate"].includes(key) && value > 1) throw new Error(`${key} must be between 0 and 1`);
    }
    if (key === "defaultCurrency" && (typeof value !== "string" || !/^[A-Z]{3}$/.test(value))) {
      throw new Error("defaultCurrency must be a three-letter ISO currency code");
    }
    if (["platformName", "supportEmail", "supportPhone", "jwtExpiry", "defaultReturnPolicy"].includes(key) && typeof value !== "string") {
      throw new Error(`${key} must be a string`);
    }
    if (key === "catalogFilters") {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("catalogFilters must be an object");
      for (const field of ["productModes", "venueTypes", "serviceTypes", "jobIndustries", "companySizes", "courseLevels", "eventTypes", "jobCategories", "jobTypes", "experienceLevels", "courseCategories"]) {
        if (value[field] !== undefined && (!Array.isArray(value[field]) || value[field].length > 100 || value[field].some((item) => typeof item !== "string" || !item.trim() || item.length > 100))) {
          throw new Error(`catalogFilters.${field} must be a list of up to 100 non-empty labels`);
        }
      }
    }
    changes[key] = value;
  }
  return changes;
}

module.exports = { EDITABLE_SETTING_KEYS, pickAndValidateSettings };
