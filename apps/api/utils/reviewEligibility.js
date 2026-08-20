function normalizeOrderValue(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') return String(value._id || value.id || value.toString?.() || '');
  return String(value);
}

function orderQualifiesForReview(order, productId) {
  if (!order || !productId) return false;

  const normalizedProductId = normalizeOrderValue(productId);

  const itemMatches = Array.isArray(order.items)
    ? order.items.some((item) => normalizeOrderValue(item?.productId) === normalizedProductId)
    : false;

  if (!itemMatches) return false;

  const orderStatus = String(order.orderStatus || order.status || '').toLowerCase();
  const paymentStatus = String(order.paymentStatus || '').toLowerCase();
  const shipmentStatus = String(order.shipmentDetails?.status || order.shipmentDetails?.trackingStatus || '').toLowerCase();
  const trackingStatus = String(order.shipmentDetails?.trackingStatus || '').toLowerCase();

  const isConfirmed = ['confirmed', 'completed'].includes(orderStatus);
  const isPaid = ['paid', 'authorized'].includes(paymentStatus);
  const isDelivered = shipmentStatus.includes('delivered') || trackingStatus.includes('delivered');

  return isConfirmed || isPaid || isDelivered;
}

module.exports = {
  orderQualifiesForReview,
};
