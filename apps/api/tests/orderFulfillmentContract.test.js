const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (relative) => fs.readFileSync(path.join(__dirname, "..", relative), "utf8");

test("product order fulfillment requires a verified, unused server payment quote", () => {
  const source = read("controllers/ecommUser/orderController.js");
  assert.match(source, /paymentFor: "product_order"/);
  assert.match(source, /status: "completed"/);
  assert.match(source, /fulfilledAt: null/);
  assert.match(source, /payment\.metadata\?\.items/);
  assert.doesNotMatch(source, /const \{\s*items,\s*amount,/);
});

test("fulfillment creates invoices and clears only the quoted cart", () => {
  const source = read("controllers/ecommUser/orderController.js");
  assert.match(source, /await Invoice\.create/);
  assert.match(source, /payment\.fulfilledOrderIds/);
  assert.match(source, /_id: payment\.metadata\.cartId, userId: req\.user\.id/);
});

test("invoice-by-order lookup is scoped to its buyer", () => {
  const source = read("controllers/ecommUser/invoiceController.js");
  assert.match(source, /orderId: req\.params\.orderId, userId: req\.user\.id/);
});
