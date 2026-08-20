const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (relative) => fs.readFileSync(path.join(__dirname, "..", relative), "utf8");

test("customer return creation is scoped to an owned order and derives commercial fields", () => {
  const source = read("controllers/ecommUser/returnController.js");
  assert.match(source, /String\(order\.buyerId\) !== String\(requesterId\)/);
  assert.match(source, /amount: Number\(order\.amount \|\| 0\)/);
  assert.match(source, /sellerId = order\.sellerId/);
  assert.doesNotMatch(source, /const \{ orderId, reason, amount,/);
});

test("only sellers and admins can approve, reject, or refund returns", () => {
  const source = read("routes/ecommUser/returnRoutes.js");
  assert.ok(source.includes('approve/:id", auth, requireRole("admin","seller")'));
  assert.ok(source.includes('reject/:id", auth, requireRole("admin","seller")'));
  assert.ok(source.includes('refund/:id", auth, requireRole("admin","seller")'));
  assert.match(read("controllers/ecommUser/returnController.js"), /String\(request\.sellerId\) !== String\(userId\)/);
});

test("invoices persist shipping as part of the authoritative breakdown", () => {
  assert.match(read("models/shared/Invoice.js"), /shipping: Number/);
  assert.match(read("controllers/ecommUser/orderController.js"), /shipping: group\.shipping/);
});
