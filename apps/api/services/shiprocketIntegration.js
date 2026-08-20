function toTitleCase(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildShiprocketOrderPayload(orderData = {}) {
  const customerName = String(orderData.customerName || orderData.shippingAddress?.name || 'Customer User').trim();
  const nameParts = customerName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || 'User';
  const shippingAddress = orderData.shippingAddress || {};
  const orderItems = Array.isArray(orderData.items) && orderData.items.length > 0
    ? orderData.items.map((item) => ({
        name: String(item.title || item.name || 'Product'),
        sku: String(item.productId || item.sku || 'SKU'),
        units: Math.max(1, Number(item.quantity || 1) || 1),
        selling_price: Number(item.price || item.amount || 0),
      }))
    : [{ name: String(orderData.service || 'Product'), sku: String(orderData._id || 'SKU'), units: 1, selling_price: Number(orderData.amount || 0) }];

  return {
    order_id: String(orderData._id || orderData.orderId || `ORD-${Date.now()}`),
    order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    pickup_location: 'Primary',
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: String(shippingAddress.street || 'Street Address'),
    billing_city: String(shippingAddress.city || 'City'),
    billing_pincode: String(shippingAddress.pincode || '110001'),
    billing_state: String(shippingAddress.state || 'State'),
    billing_country: 'India',
    billing_email: String(orderData.customerEmail || 'customer@example.com'),
    billing_phone: String(shippingAddress.phone || '9876543210').replace(/\D/g, '').slice(-10),
    shipping_is_billing: false,
    shipping_customer_name: customerName,
    shipping_last_name: lastName,
    shipping_address: String(shippingAddress.street || 'Street Address'),
    shipping_city: String(shippingAddress.city || 'City'),
    shipping_pincode: String(shippingAddress.pincode || '110001'),
    shipping_state: String(shippingAddress.state || 'State'),
    shipping_country: 'India',
    shipping_email: String(orderData.customerEmail || 'customer@example.com'),
    shipping_phone: String(shippingAddress.phone || '9876543210').replace(/\D/g, '').slice(-10),
    order_items: orderItems,
    payment_method: String(orderData.paymentMethod || 'Prepaid').toUpperCase() === 'COD' ? 'COD' : 'Prepaid',
    sub_total: Number(orderData.amount || 0),
    length: Number(orderData.length || 10),
    breadth: Number(orderData.breadth || 10),
    height: Number(orderData.height || 10),
    weight: Number(orderData.weight || 0.5),
  };
}

function normalizeShiprocketResponse(response = {}) {
  const next = {
    shiprocketOrderId: response.order_id || response.shiprocketOrderId || '',
    shipmentId: response.shipment_id || response.shipmentId || '',
    awbCode: response.awb_code || response.awbCode || response.awb || '',
    courierName: response.courier_name || response.courierName || '',
    trackingUrl: response.tracking_url || response.trackingUrl || '',
    status: response.status || 'PENDING',
    meta: response,
  };
  return next;
}

module.exports = {
  buildShiprocketOrderPayload,
  normalizeShiprocketResponse,
  toTitleCase,
};
