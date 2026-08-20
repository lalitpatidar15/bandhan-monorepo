const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveBuyerIdentity, resolveSellerIdentity } = require("../utils/ecommIdentity.js");

test("resolveBuyerIdentity uses the authenticated profile when no explicit buyer values are present", () => {
  const result = resolveBuyerIdentity({}, { fullName: "Asha Buyer", email: "asha@example.com" });
  assert.equal(result.name, "Asha Buyer");
  assert.equal(result.email, "asha@example.com");
});

test("resolveSellerIdentity uses the seller profile for product listings", () => {
  const result = resolveSellerIdentity({}, { fullName: "Ravi Seller", email: "ravi@example.com" });
  assert.equal(result.name, "Ravi Seller");
  assert.equal(result.email, "ravi@example.com");
});
