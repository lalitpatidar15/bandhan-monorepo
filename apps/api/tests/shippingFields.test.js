const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeShippingFields,
  validateShippingForActive,
} = require('../utils/shippingFields.js');
const { buildShiprocketOrderPayload } = require('../services/shiprocketIntegration.js');

test('normalizeShippingFields parses FormData-style shipping values', () => {
  const fields = normalizeShippingFields({
    weight: '1.25',
    dimensions: JSON.stringify({ length: '20', width: '15', height: '10' }),
    originPincode: '4520 01',
    shippingRequired: 'true',
    freeShipping: 'false',
    shippingCost: '49',
    pickupLocation: 'Primary',
    hsnCode: '6912',
  });

  assert.equal(fields.weight, 1.25);
  assert.equal(fields.shippingWeight, 1.25);
  assert.deepEqual(fields.dimensions, { length: 20, width: 15, height: 10 });
  assert.equal(fields.originPincode, '452001');
  assert.equal(fields.shippingRequired, true);
  assert.equal(fields.freeShipping, false);
  assert.equal(fields.shippingCost, 49);
  assert.equal(fields.hsnCode, '6912');
});

test('normalizeShippingFields only returns supplied keys', () => {
  assert.deepEqual(normalizeShippingFields({ title: 'Pot', price: 499 }), {});
  assert.deepEqual(normalizeShippingFields({ shippingRequired: false }), { shippingRequired: false });
});

test('active products require courier package details before publishing', () => {
  const missing = validateShippingForActive({ shippingRequired: true });
  assert.match(missing, /weight/i);

  const missingPincode = validateShippingForActive({
    weight: 1,
    dimensions: { length: 10, width: 10, height: 10 },
  });
  assert.match(missingPincode, /pincode/i);

  const complete = validateShippingForActive({
    weight: 1,
    dimensions: { length: 10, width: 10, height: 10 },
    originPincode: '452001',
  });
  assert.equal(complete, null);

  assert.equal(validateShippingForActive({ shippingRequired: false }), null);
});

test('Shiprocket payload uses captured product package data', () => {
  const payload = buildShiprocketOrderPayload({
    _id: 'order_123',
    customerName: 'Asha Patel',
    amount: 998,
    shippingAddress: { pincode: '452001', phone: '9876543210' },
    dimensions: { length: 25, width: 18, height: 12 },
    weight: 1.5,
    pickupLocation: 'Studio Pickup',
  });

  assert.equal(payload.length, 25);
  assert.equal(payload.breadth, 18);
  assert.equal(payload.height, 12);
  assert.equal(payload.weight, 1.5);
  assert.equal(payload.pickup_location, 'Studio Pickup');
});
