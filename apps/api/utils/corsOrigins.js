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
  // Current production aliases for every public portal.
  "https://bandhan-user.vercel.app",
  "https://product-seller.vercel.app",
  "https://bandhan-student.vercel.app",
  "https://bandhan-jobs-eight.vercel.app",
  "https://bandhan-admin-three.vercel.app",
  // Vercel's production URLs for the Bandhan team.
  "https://bandhan-user-lalit-patidars-projects.vercel.app",
  "https://product-seller-lalit-patidars-projects.vercel.app",
  "https://bandhan-student-lalit-patidars-projects.vercel.app",
  "https://bandhan-jobs-lalit-patidars-projects.vercel.app",
  "https://bandhan-admin-lalit-patidars-projects.vercel.app",
];

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...DEFAULT_ORIGINS, ...configuredOrigins])];

// Preview deployments created inside the Bandhan Vercel team use this shape.
// Restricting the team suffix keeps unknown Vercel projects out while allowing
// the portal previews that Vercel creates for this repository.
const OWNED_VERCEL_DEPLOYMENT_ORIGIN =
  /^https:\/\/(?:bandhan-user|product-seller|bandhan-student|bandhan-jobs|bandhan-admin)-[a-z0-9-]+-lalit-patidars-projects\.vercel\.app$/;

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (OWNED_VERCEL_DEPLOYMENT_ORIGIN.test(origin)) return true;
  return /^https?:\/\/(?:localhost|127\.0\.0\.1):[3-9]\d{3}$/.test(origin);
};

module.exports = { allowedOrigins, isOriginAllowed };
