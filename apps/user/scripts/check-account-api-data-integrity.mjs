import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readUser = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const readApi = (path) => readFile(new URL(`../../api/${path}`, import.meta.url), "utf8");

const [
  dashboardPage,
  dashboardApi,
  dashboardController,
  paymentsPage,
  ordersPage,
  notificationsPage,
  notificationController,
  wishlistPage,
  wishlistApi,
  planner,
  enquiriesPage,
  enquiryModal,
  enquiryModel,
  categoryGrid,
  collections,
  trustBar,
] = await Promise.all([
  readUser("app/userdashboard/dashboard/page.tsx"),
  readUser("store/api/dashboardApi.ts"),
  readApi("controllers/ecommUser/dashboardController.js"),
  readUser("app/userdashboard/payments/page.tsx"),
  readUser("app/userdashboard/orders/page.tsx"),
  readUser("app/userdashboard/notification/page.tsx"),
  readApi("controllers/ecommUser/notificationController.js"),
  readUser("app/userdashboard/wishlist/page.tsx"),
  readUser("store/api/wishlistApi.ts"),
  readUser("components/userDashboard/planner/EventPlanner.tsx"),
  readUser("app/userdashboard/enquiries/page.tsx"),
  readUser("components/Enquiry/EnquiryModal.tsx"),
  readApi("models/shared/Enquiry.js"),
  readUser("components/home/CategoryGrid.tsx"),
  readUser("components/home/PromoCollections.tsx"),
  readUser("components/home/TrustBar.tsx"),
]);

assert.match(dashboardApi, /query:\s*\(\)\s*=>\s*["']\/dashboard\/buyer["']/);
assert.match(dashboardPage, /planningProgress/);
assert.match(dashboardController, /Event\.find\(\{ owner: userId/);
assert.match(dashboardController, /RentalOrder\.countDocuments/);
assert.doesNotMatch(dashboardController, /vendorsActive:\s*1/);
assert.doesNotMatch(dashboardController, /guestsConfirmed:/);
assert.doesNotMatch(dashboardPage, /guestInquiries/);

assert.match(paymentsPage, /useGetUserInvoicesQuery/);
assert.doesNotMatch(paymentsPage, /useGetUserOrdersQuery/);
assert.doesNotMatch(paymentsPage, /Amount Paid/);
assert.doesNotMatch(paymentsPage, /Date\.now\(\)/);

assert.match(ordersPage, /shipmentStatus/);
assert.doesNotMatch(ordersPage, /Merchant Health|Upcoming Deliveries|>Filter<|>Export<|₹0/);
assert.doesNotMatch(ordersPage, /Date\.now\(\)/);

assert.match(notificationsPage, /useGetNotificationsQuery/);
assert.match(notificationController, /relatedId:\s*item\.referenceId/);
assert.doesNotMatch(notificationsPage, /Jayesh Modi|Lead Curator/);

assert.match(wishlistPage, /useGetWishlistQuery/);
assert.match(wishlistPage, /isError/);
assert.match(wishlistApi, /invalidatesTags:\s*\["Dashboard"\]/);
assert.match(planner, /eventsError/);
assert.match(planner, /eventError/);
assert.match(enquiriesPage, /useGetEnquiriesQuery/);
assert.doesNotMatch(enquiriesPage, /localStorage|bandhan_enquiries/);
assert.doesNotMatch(enquiryModal, /localStorage|bandhan_enquiries|fall back to local/);
for (const field of ["requiredDate", "budget", "guestCount", "title"]) {
  assert.match(enquiryModel, new RegExp(field), `enquiry API model must persist ${field}`);
}

assert.match(categoryGrid, /href:\s*["']\/courses["']/);
assert.match(categoryGrid, /href:\s*["']\/jobs["']/);
assert.doesNotMatch(categoryGrid, /bandhan-student-two|bandhan-jobs\.vercel/);
assert.doesNotMatch(collections, /\?tag=/);
assert.doesNotMatch(trustBar, /Free shipping over|7-day returns|24\/7 support|EMI options available/);

console.log("Dashboard, orders, payments, notifications, wishlist, planner, and home claims use API-authoritative or honest states.");
