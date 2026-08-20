const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "../controllers/ecommUser/serviceController.js"),
  "utf8"
);

assert.match(source, /const searchTerm = String\(search \|\| q/);
assert.match(source, /if \(eventType\) query\.eventType/);
assert.match(source, /const requestedGuests = Number\(guests\)/);
assert.match(source, /pagination: \{/);
assert.match(source, /Service\.findOne\(\{[\s\S]*status: "active",[\s\S]*isActive: true/);
assert.doesNotMatch(source, /Service\.findById\(req\.params\.id\)/);

console.log("Public service search, planner filters, pagination, and detail visibility are API-backed.");
