const isProductionBuild = process.env.NODE_ENV === "production";

function portalUrl(configuredUrl: string | undefined, productionUrl: string, localUrl: string) {
  const pointsToLocalhost = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/.test(configuredUrl || "");
  if (isProductionBuild && (!configuredUrl || pointsToLocalhost)) return productionUrl;
  return configuredUrl || localUrl;
}

// Environment variables take precedence. These defaults ensure a deployed
// central login never sends a user to a localhost-only portal.
export const STUDENT_PORTAL_URL = portalUrl(process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL, "https://bandhan-student-lalit-patidars-projects.vercel.app", "http://localhost:3002");
export const JOB_PORTAL_URL = portalUrl(process.env.NEXT_PUBLIC_JOB_PORTAL_URL, "https://bandhan-jobs-lalit-patidars-projects.vercel.app", "http://localhost:3003");
export const SELLER_PORTAL_URL = portalUrl(process.env.NEXT_PUBLIC_SELLER_PORTAL_URL, "https://product-seller-lalit-patidars-projects.vercel.app", "http://localhost:3001");
