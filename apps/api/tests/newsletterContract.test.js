const test = require("node:test");
const assert = require("node:assert/strict");

const publicRoutes = require("../routes/public/publicRoutes.js");
const NewsletterSubscriber = require("../models/shared/NewsletterSubscriber.js");

test("the public newsletter endpoint is registered as a rate-limited POST", () => {
  const route = publicRoutes.stack.find((layer) => layer.route?.path === "/newsletter");
  assert.ok(route);
  assert.equal(route.route.methods.post, true);
  assert.ok(route.route.stack.length >= 3);
});

test("newsletter emails are normalized and unique", () => {
  const emailPath = NewsletterSubscriber.schema.path("email");
  assert.equal(emailPath.options.lowercase, true);
  assert.equal(emailPath.options.trim, true);
  assert.equal(emailPath.options.unique, true);
});
