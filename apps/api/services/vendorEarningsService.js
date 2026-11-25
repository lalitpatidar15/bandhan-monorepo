const VendorEarning = require("../models/shared/VendorEarning.js");
const { getSetting } = require("./configService.js");

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

// Central commission source. AdminSetting.platform.commissionRate overrides this.
async function getCommissionRate() {
  const configured = Number(await getSetting("commissionRate"));
  if (!Number.isFinite(configured) || configured < 0 || configured > 1) return 0.1;
  return configured;
}

function groupOrderItems(orderItems) {
  const groups = new Map();
  for (const item of orderItems || []) {
    const vendorType = ["service", "venue"].includes(item.itemType) ? item.itemType : "product";
    const key = `${vendorType}:${String(item.sellerId || item.providerId || "")}`;
    const group = groups.get(key) || {
      vendorId: item.sellerId || item.providerId,
      vendorType,
      vendorName: item.sellerName || "",
      gross: 0,
    };
    group.gross += Number(item.price || 0) * Number(item.quantity || 1);
    groups.set(key, group);
  }
  return [...groups.values()].filter((group) => group.vendorId);
}

async function recordProductOrderEarnings({ payment, orders, session }) {
  if (!payment || !Array.isArray(orders) || orders.length === 0) return [];
  const rate = await getCommissionRate();
  const paidItems = Array.isArray(payment.metadata?.items) ? payment.metadata.items : [];
  const summary = payment.metadata?.summary || {};
  const shippingByProduct = new Map(
    paidItems.map((item) => [String(item.productId), Number(item.shippingCost || 0) * Number(item.quantity || 1)])
  );
  const subtotalBase = Number(summary.subtotal || 0) || 0;
  const serviceFee = Number(summary.serviceFee || 0) || 0;
  const tax = Number(summary.tax || 0) || 0;
  const docs = [];

  for (const order of orders) {
    const groups = groupOrderItems(order.items);
    for (const group of groups) {
      const weight = subtotalBase > 0 ? group.gross / subtotalBase : 1 / groups.length;
      let shipping = 0;
      for (const item of order.items || []) {
        if (String(item.sellerId || item.providerId) === String(group.vendorId)) {
          shipping += shippingByProduct.get(String(item.productId)) || 0;
        }
      }
      const commission = round2(group.gross * rate);
      docs.push({
        vendorId: group.vendorId,
        vendorType: group.vendorType,
        vendorName: group.vendorName || order.sellerName || "",
        orderId: order._id,
        paymentId: payment._id,
        razorpayPaymentId: payment.transactionId || "",
        buyerId: payment.userId,
        currency: payment.currency || "INR",
        grossAmount: round2(group.gross),
        commissionRate: rate,
        commission,
        shippingPassThrough: round2(shipping),
        taxPassThrough: round2(tax * weight),
        platformServiceFeeShare: round2(serviceFee * weight),
        netPayable: round2(Math.max(0, group.gross - commission)),
        note: "Derived from captured product order payment",
      });
    }
  }

  if (!docs.length) return [];
  const existing = await VendorEarning.find({
    paymentId: payment._id,
    orderId: { $in: docs.map((doc) => doc.orderId) },
  })
    .select("orderId vendorId vendorType")
    .session(session || null)
    .lean();
  const seen = new Set(existing.map((entry) => `${entry.orderId}:${entry.vendorId}:${entry.vendorType}`));
  const fresh = docs.filter((doc) => !seen.has(`${doc.orderId}:${doc.vendorId}:${doc.vendorType}`));
  if (!fresh.length) return [];
  return VendorEarning.create(fresh, session ? { session } : {});
}

async function recordBookingEarnings({ payment, booking, session }) {
  if (!payment || !booking) return [];
  const rate = await getCommissionRate();
  const vendorType = booking.bookingType === "service" ? "service" : "venue";
  const vendorId =
    payment.metadata?.vendorId ||
    booking.items?.[0]?.providerId ||
    booking.venueId?.sellerId ||
    booking.venueId ||
    null;
  if (!vendorId) return [];
  const gross = round2(booking.pricing?.subtotal || 0);
  const commission = round2(gross * rate);
  const doc = {
    vendorId,
    vendorType,
    vendorName: payment.metadata?.vendorName || booking.venueId?.name || booking.items?.[0]?.title || "",
    bookingId: booking._id,
    paymentId: payment._id,
    razorpayPaymentId: payment.transactionId || "",
    buyerId: payment.userId,
    currency: payment.currency || "INR",
    grossAmount: gross,
    commissionRate: rate,
    commission,
    shippingPassThrough: 0,
    taxPassThrough: round2(booking.pricing?.tax || 0),
    platformServiceFeeShare: round2(booking.pricing?.serviceFee || 0),
    netPayable: round2(Math.max(0, gross - commission)),
    note: "Derived from captured service/venue booking payment",
  };
  const exists = await VendorEarning.findOne({
    paymentId: payment._id,
    bookingId: booking._id,
    vendorId,
    vendorType,
  })
    .session(session || null)
    .lean();
  if (exists) return [];
  return VendorEarning.create([doc], session ? { session } : {});
}

async function recordRefund({ paymentId, orderId, bookingId, amount, session }) {
  const filter = { paymentId, status: { $ne: "refunded" } };
  if (orderId) filter.orderId = orderId;
  if (bookingId) filter.bookingId = bookingId;
  const earnings = await VendorEarning.find(filter).session(session || null);
  if (!earnings.length) return 0;
  const totalOutstanding = earnings.reduce(
    (sum, entry) => sum + Math.max(0, Number(entry.netPayable || 0) - Number(entry.refundedAmount || 0)),
    0
  );
  if (totalOutstanding <= 0) return 0;
  const refundable = Math.min(Number(amount) || 0, totalOutstanding);
  for (const entry of earnings) {
    const outstanding = Math.max(0, Number(entry.netPayable || 0) - Number(entry.refundedAmount || 0));
    const share = round2(refundable * (outstanding / totalOutstanding));
    entry.refundedAmount = round2(Number(entry.refundedAmount || 0) + share);
    if (entry.refundedAmount >= Number(entry.netPayable || 0) - 0.01) entry.status = "refunded";
    else entry.status = "partially_refunded";
    if (session) await entry.save({ session });
    else await entry.save();
  }
  return refundable;
}

module.exports = {
  getCommissionRate,
  recordProductOrderEarnings,
  recordBookingEarnings,
  recordRefund,
};
