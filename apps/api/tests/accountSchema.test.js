const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../models/shared/User.js");
const Review = require("../models/shared/Review.js");

test("profile fields and preferences are persisted by the shared user schema", () => {
  const user = new User({
    address: "Indore, Madhya Pradesh",
    preferences: { notifications: false, newsletter: true },
  });

  assert.equal(user.address, "Indore, Madhya Pradesh");
  assert.equal(user.preferences.notifications, false);
  assert.equal(user.preferences.newsletter, true);
});

test("reviews enforce one record per authenticated user and product", () => {
  const uniqueIndex = Review.schema.indexes().find(
    ([fields, options]) => fields.productId === 1 && fields.userId === 1 && options.unique === true
  );
  assert.ok(uniqueIndex);
});
