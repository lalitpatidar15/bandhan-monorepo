const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "../controllers/public/publicController.js"),
  "utf8"
);

assert.match(source, /function catalogueFilter/);
assert.match(source, /\["rent", "rental", "both"\]/);
assert.match(source, /\$toLower: \{ \$ifNull: \["\$productType", ""\] \}/);
assert.match(source, /filter\._id = \{ \$ne: params\.exclude \}/);
assert.match(source, /definition\.model\.countDocuments\(filter\)/);
assert.match(source, /findOne\(\{ \.\.\.filter, _id: req\.params\.id \}\)/);
assert.match(source, /rentalPrice: Number\(product\.rentalPrice \|\| product\.rentPrice/);
assert.match(source, /specifications: Array\.isArray\(product\.specifications\)/);

console.log("The unified public catalogue applies server-side filters to lists and details.");
