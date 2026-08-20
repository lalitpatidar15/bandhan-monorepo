const test = require('node:test');
const assert = require('node:assert/strict');
const { buildShiprocketOrderPayload, normalizeShiprocketResponse } = require('../services/shiprocketIntegration.js');

test('buildShiprocketOrderPayload maps customer and item details correctly', () => {
  const payload = buildShiprocketOrderPayload({
    _id: 'order_123',
    customerName: 'Asha Patel',
    sellerName: 'Bandhan Seller',
    amount: 998,
    items: [{ title: 'Handmade Pottery Set', price: 499, quantity: 2 }],
    shippingAddress: {
      name: 'Asha Patel',
      street: '12 Main Street',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452001',
      phone: '9876543210',
    },
  });

  assert.equal(payload.order_id, 'order_123');
  assert.equal(payload.billing_customer_name, 'Asha');
  assert.equal(payload.shipping_customer_name, 'Asha Patel');
  assert.equal(payload.order_items[0].name, 'Handmade Pottery Set');
  assert.equal(payload.order_items[0].units, 2);
  assert.equal(payload.sub_total, 998);
});

test('normalizeShiprocketResponse extracts shipment and awb values', () => {
  const details = normalizeShiprocketResponse({
    order_id: 'order_123',
    shipment_id: 45678,
    awb_code: '1234567890',
    courier_name: 'Delhivery',
    tracking_url: 'https://tracking.example/1234567890',
  });

  assert.equal(details.shiprocketOrderId, 'order_123');
  assert.equal(details.shipmentId, 45678);
  assert.equal(details.awbCode, '1234567890');
  assert.equal(details.courierName, 'Delhivery');
  assert.equal(details.trackingUrl, 'https://tracking.example/1234567890');
});
