const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3010",
  "http://192.168.1.27:3000",
  "https://bonding-absently-fragrant.ngrok-free.dev",
  "https://bandhan-admin-delta.vercel.app",
  "https://bandhan-jobs.vercel.app",
  "https://product-seller-vert.vercel.app",
  "https://bandhan-landing.vercel.app",
  "https://bandhan-student-two.vercel.app",
  "https://bandhan-user-nine.vercel.app",
];

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...DEFAULT_ORIGINS, ...configuredOrigins])];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return /^https?:\/\/(?:localhost|127\.0\.0\.1):[3-9]\d{3}$/.test(origin);
};

module.exports = { allowedOrigins, isOriginAllowed };
