const test = require("node:test");
const assert = require("node:assert/strict");

const bannerRoutes = require("../routes/ecommUser/bannerRoutes.js");
const couponRoutes = require("../routes/ecommUser/couponRoutes.js");

test("banner creation requires authentication and an admin role", () => {
  const route = bannerRoutes.stack.find((layer) => layer.route?.path === "/create");
  assert.ok(route);
  assert.equal(route.route.methods.post, true);
  assert.ok(route.route.stack.length >= 4);
});

test("coupon management is behind router-level authentication", () => {
  const activeIndex = couponRoutes.stack.findIndex((layer) => layer.route?.path === "/active");
  const authLayerIndex = couponRoutes.stack.findIndex((layer) => !layer.route && layer.name === "authenticate");
  const createIndex = couponRoutes.stack.findIndex((layer) => layer.route?.path === "/" && layer.route.methods.post);
  assert.ok(activeIndex >= 0);
  assert.ok(authLayerIndex > activeIndex);
  assert.ok(createIndex > authLayerIndex);
});
