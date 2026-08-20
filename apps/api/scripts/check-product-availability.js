const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const model = read("models/shared/Product.js");
const products = read("controllers/ecommUser/productController.js");
const rentals = read("controllers/ecommUser/rentalOrderController.js");

assert.match(model, /\["sale", "rent", "both"\]/);
assert.match(model, /normalized === "rental"/);
assert.doesNotMatch(model, /normalized === "both"\) return "rental"/);
assert.match(products, /\["rent", "rental", "both"\]/);
assert.match(products, /\["sale", "both"\]/);
assert.match(products, /\$toLower: \{ \$ifNull: \["\$productType", ""\] \}/);
assert.match(rentals, /\["rent", "rental", "both"\]\.includes/);

console.log("Sale, rent, and both availability remain distinct and legacy rental records stay usable.");
