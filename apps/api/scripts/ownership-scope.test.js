const assert = require("assert");
const { getAuthenticatedOwnerId, buildOwnerScopeFilter, buildOwnerScopeFilterForItems } = require("../utils/ownership.js");

const sellerReq = { user: { id: "seller-123", role: "seller" } };
const adminReq = { user: { id: "admin-1", role: "admin" } };

assert.strictEqual(getAuthenticatedOwnerId(sellerReq), "seller-123");
assert.strictEqual(getAuthenticatedOwnerId(adminReq), "admin-1");
assert.deepStrictEqual(buildOwnerScopeFilter(sellerReq, { status: "active" }), { status: "active", sellerId: "seller-123" });
assert.deepStrictEqual(buildOwnerScopeFilter(adminReq, { status: "active" }), { status: "active" });
assert.deepStrictEqual(buildOwnerScopeFilterForItems(sellerReq, { status: "pending" }), { status: "pending", "items.sellerId": "seller-123" });

console.log("ownership scope regression checks passed");
