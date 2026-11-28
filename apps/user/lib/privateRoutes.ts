/**
 * Top-level routes that require the central Bandhan session.
 *
 * The user app keeps account pages at the root now, so the guard cannot rely on
 * a single path prefix. Keep this list shared by the client guard, the mobile
 * navigation and the server proxy to avoid them drifting apart.
 */
export const PRIVATE_ROUTES = new Set([
  "addresses",
  "booking",
  "cart",
  "checkout",
  "communities",
  "compare",
  "confirmation",
  "dashboard",
  "enquiries",
  "feed",
  "inbox",
  "invoice",
  "my-rentals",
  "notification",
  "orders",
  "payments",
  "planner",
  "profile",
  "quote",
  "refunds",
  "service-booking",
  "service-bookings",
  "support",
  "userTracking",
  "venue-bookings",
  "wishlist",
]);

export function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTES.has(pathname.split("/")[1] || "");
}
