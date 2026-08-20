const test = require("node:test");
const assert = require("node:assert/strict");

const { allowedOrigins, isOriginAllowed } = require("../utils/corsOrigins.js");

test("REST and Socket.IO share the current production portal origins", () => {
  assert.equal(allowedOrigins.includes("http://localhost:3010"), true);
  assert.equal(isOriginAllowed("https://bandhan-user.vercel.app"), true);
  assert.equal(isOriginAllowed("https://product-seller-lalit-patidars-projects.vercel.app"), true);
  assert.equal(isOriginAllowed("https://bandhan-student.vercel.app"), true);
  assert.equal(isOriginAllowed("https://bandhan-jobs-eight.vercel.app"), true);
  assert.equal(isOriginAllowed("https://bandhan-admin-three.vercel.app"), true);
});

test("Bandhan Vercel preview deployments are accepted without opening CORS to other teams", () => {
  assert.equal(
    isOriginAllowed("https://bandhan-user-feature-catalog-lalit-patidars-projects.vercel.app"),
    true,
  );
  assert.equal(isOriginAllowed("https://bandhan-user-evil.vercel.app"), false);
});

test("local portal ports are accepted but unknown remote origins are rejected", () => {
  assert.equal(isOriginAllowed("http://localhost:3010"), true);
  assert.equal(isOriginAllowed("http://127.0.0.1:3004"), true);
  assert.equal(isOriginAllowed("https://untrusted.example"), false);
});
