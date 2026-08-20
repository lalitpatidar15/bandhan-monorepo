const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const routes = read("routes/ecommUser/productRoutes.js");
const products = read("controllers/ecommUser/productController.js");
const publicController = read("controllers/public/publicController.js");
const venues = read("controllers/ecommUser/venueController.js");

assert.match(routes, /router\.get\("\/", productController\.getPublicProducts\)/);
assert.match(products, /isPublished:\s*true/);
assert.match(products, /isApproved:\s*true/);
assert.match(publicController, /isPublished:\s*true, isApproved:\s*true/);
assert.match(venues, /isApproved:\s*\{ \$ne: false \}/);

console.log("Public catalogue and detail routes enforce moderation visibility.");
