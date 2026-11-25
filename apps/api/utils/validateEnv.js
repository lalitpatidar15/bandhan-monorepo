const requiredVariables = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUD_NAME",
  "CLOUD_API_KEY",
  "CLOUD_API_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
];

module.exports = function validateEnv() {
  const missing = requiredVariables.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
