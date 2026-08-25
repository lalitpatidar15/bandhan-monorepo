const test = require("node:test");
const assert = require("node:assert/strict");

const Payment = require("../models/shared/Payment.js");
const courseController = require("../controllers/Student/courseController.js");
const courseRoutes = require("../routes/student/courseRoutes.js");

test("course payments use a valid shared Payment contract", () => {
  assert.ok(Payment.schema.path("paymentFor").enumValues.includes("course"));
  assert.ok(Payment.schema.path("paymentMethod").enumValues.includes("pending"));
  assert.equal(Payment.schema.path("paymentMethod").enumValues.includes("razorpay"), false);
});

test("student course wishlist status route is available", () => {
  assert.equal(typeof courseController.getWishlistStatus, "function");
  const hasWishlistStatusRoute = courseRoutes.stack.some(
    (layer) => layer.route?.path === "/wishlist/:courseId" && layer.route.methods.get,
  );
  assert.equal(hasWishlistStatusRoute, true);
});
