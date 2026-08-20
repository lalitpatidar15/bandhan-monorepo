const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const app = read("app.js");
const model = read("models/shared/Event.js");
const controller = read("controllers/ecommUser/eventController.js");

assert.match(app, /app\.use\("\/api\/events", eventRoutes\)/);
assert.match(model, /owner:[\s\S]*required: true/);
assert.match(model, /timestamps: true/);
assert.match(model, /allocated: \{ type: Map/);
assert.match(controller, /Event\.findOne\(\{ _id: req\.params\.id, owner: req\.user\.id \}\)/);
assert.match(controller, /\{ events: events\.map\(serializeEvent\), total: events\.length \}/);
assert.match(controller, /event: serializeEvent\(event\)/);
assert.doesNotMatch(controller, /Event\.findById(?:AndUpdate|AndDelete)?\(/);

console.log("Event planner routes are mounted, owner-scoped, and match the frontend response contract.");
