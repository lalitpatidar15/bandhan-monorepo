const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true, index: true },
  customer: String,
  customerName: String,
  product: String,
  productName: String,
  type: String,
  provider: { type: String, default: "shiprocket", enum: ["shiprocket", "manual"] },
  partner: String,
  status: { type: String, default: "created" },
  shiprocketOrderId: String,
  shipmentId: String,
  awbCode: String,
  courierCompanyId: Number,
  courierName: String,
  labelUrl: String,
  trackingUrl: String,
  address: String,
  lastSyncedAt: Date,
  lastError: String,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model("Shipping", shippingSchema);
