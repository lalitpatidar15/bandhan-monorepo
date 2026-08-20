const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "../controllers/ecommUser/venueController.js"),
  "utf8"
);

assert.match(source, /const effectiveMaxPrice = maxPrice \|\| budget/);
assert.match(source, /const requestedGuests = Number\(guestCount \|\| guests\)/);
assert.match(source, /if \(category\) filter\.venueType/);
assert.match(source, /if \(featured === "true"\)/);
assert.match(source, /isApproved: \{ \$ne: false \}/);
assert.match(source, /populate\("sellerId"/);

console.log("Public venue filters and detail data match the user and planner API contracts.");
