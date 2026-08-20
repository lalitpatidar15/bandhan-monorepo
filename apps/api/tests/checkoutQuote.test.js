const test = require("node:test");
const assert = require("node:assert/strict");

const Payment = require("../models/shared/Payment.js");
const { calculateQuoteTotals } = require("../services/checkoutService.js");

test("checkout totals are calculated from server item prices and settings", () => {
  const totals = calculateQuoteTotals([
    { unitPrice: 1_000, quantity: 2, shippingCost: 50 },
    { unitPrice: 500, quantity: 1, shippingCost: 0 },
  ], 150, 0.08);

  assert.deepEqual(totals, {
    subtotal: 2_500,
    shipping: 100,
    serviceFee: 150,
    tax: 220,
    discount: 0,
    total: 2_970,
  });
});

test("payments support authenticated product orders and fulfillment links", () => {
  assert.ok(Payment.schema.path("userId"));
  assert.ok(Payment.schema.path("fulfilledOrderIds"));
  assert.ok(Payment.schema.path("metadata"));
  assert.ok(Payment.schema.path("paymentFor").enumValues.includes("product_order"));
});
