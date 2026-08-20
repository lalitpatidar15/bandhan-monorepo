
const mongoose = require("mongoose");

const PRODUCT_AVAILABILITY = ["sale", "rent", "both"];

function normalizeAvailability(value) {
  if (typeof value !== "string") return "sale";

  const normalized = value.trim().toLowerCase();
  if (normalized === "rental") return "rent";
  return PRODUCT_AVAILABILITY.includes(normalized) ? normalized : "sale";
}

const specificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: String,
  price: { type: Number, required: true },
  mrp: Number,
  stock: { type: Number, default: 0 },
  stockStatus: { type: String, enum: ["in_stock", "low_stock", "out_of_stock"], default: "in_stock" },
  attributes: [specificationSchema]
}, { _id: true });

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },

  title: { type: String, required: true, trim: true },
  category: { type: String, default: "General", trim: true },
  subCategory: String,
  brand: String,
  description: String,
  tags: [String],
  images: [String],
  video: String,

  sku: { type: String, sparse: true },

  price: { type: Number, required: true },
  mrp: { type: Number },
  discount: { type: Number, default: 0 },
  discountPrice: { type: Number, default: 0 },
  rentPrice: { type: Number, default: 0 },
  discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },

  productType: {
    type: String,
    enum: PRODUCT_AVAILABILITY,
    default: "sale",
    set: normalizeAvailability
  },
  priceUnit: {
    type: String,
    enum: ["fixed", "day", "week", "month"],
    default: "fixed"
  },
  type: {
    type: String,
    enum: PRODUCT_AVAILABILITY,
    default: "sale",
    set: normalizeAvailability
  },

  rentalPrice: { type: Number },
  rentalDuration: { type: String, enum: ["day", "week", "month"], default: "day" },
  securityDeposit: { type: Number, default: 0 },
  lateReturnFee: { type: Number, default: 0 },

  stock: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  rentalStock: { type: Number, default: 0 },
  stockStatus: {
    type: String,
    enum: ["in_stock", "low_stock", "out_of_stock"],
    default: "in_stock"
  },

  specifications: [specificationSchema],
  variants: [variantSchema],

  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shippingRequired: { type: Boolean, default: true },
  shippingWeight: Number,
  shippingCost: { type: Number, default: 0 },
  freeShipping: { type: Boolean, default: false },

  location: String,
  sellerName: String,

  orders: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },

  isFeatured: { type: Boolean, default: false },
  featuredAt: Date,
  isApproved: { type: Boolean, default: false, index: true },
  isPublished: { type: Boolean, default: false, index: true },
  status: {
    type: String,
    enum: ["active", "draft"],
    default: "draft"
  },
  rejectionReason: String,
  publishedAt: Date,

  returnPolicy: { type: String, default: "7-day return policy" },
  warranty: String,

  seoTitle: String,
  seoDescription: String,
  seoTags: [String]

}, { timestamps: true });

productSchema.pre("validate", function syncAvailability(next) {
  const availability = normalizeAvailability(this.productType || this.type);
  this.productType = availability;
  this.type = availability;
  next();
});

module.exports = mongoose.model("Product", productSchema);
