const requiredVariables = ["MONGO_URI", "JWT_SECRET"];

module.exports = function validateEnv() {
  const missing = requiredVariables.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
