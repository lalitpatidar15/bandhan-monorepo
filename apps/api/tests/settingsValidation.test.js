const test = require("node:test");
const assert = require("node:assert/strict");
const { pickAndValidateSettings } = require("../services/settingsValidation");

test("keeps only explicitly editable settings", () => {
  assert.deepEqual(pickAndValidateSettings({ platformName: "Acme", key: "other", version: 99 }), { platformName: "Acme" });
});

test("rejects invalid monetary and currency settings", () => {
  assert.throws(() => pickAndValidateSettings({ taxRate: 1.2 }), /between 0 and 1/);
  assert.throws(() => pickAndValidateSettings({ platformFee: -1 }), /non-negative/);
  assert.throws(() => pickAndValidateSettings({ defaultCurrency: "rupees" }), /ISO currency/);
});
