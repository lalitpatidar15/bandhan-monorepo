const test = require("node:test");
const assert = require("node:assert/strict");

const { allowedOrigins, isOriginAllowed } = require("../utils/corsOrigins.js");

test("REST and Socket.IO share the same customer portal origins", () => {
  assert.equal(allowedOrigins.includes("http://localhost:3010"), true);
  assert.equal(allowedOrigins.includes("https://bandhan-user-nine.vercel.app"), true);
  assert.equal(allowedOrigins.includes("https://product-seller-vert.vercel.app"), true);
});

test("local portal ports are accepted but unknown remote origins are rejected", () => {
  assert.equal(isOriginAllowed("http://localhost:3010"), true);
  assert.equal(isOriginAllowed("http://127.0.0.1:3004"), true);
  assert.equal(isOriginAllowed("https://untrusted.example"), false);
});
