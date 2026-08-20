const Cart = require("../models/shared/Cart.js");
const Product = require("../models/shared/Product.js");
const { getSetting } = require("./configService.js");

class CheckoutError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "CheckoutError";
    this.statusCode = statusCode;
  }
}

function calculateQuoteTotals(items, serviceFee, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = items.reduce((sum, item) => sum + item.shippingCost * item.quantity, 0);
  const normalizedServiceFee = Math.max(0, Number(serviceFee) || 0);
  const normalizedTaxRate = Math.max(0, Number(taxRate) || 0);
  const tax = Math.round((subtotal + shipping + normalizedServiceFee) * normalizedTaxRate);
  return {
    subtotal,
    shipping,
    serviceFee: normalizedServiceFee,
    tax,
    discount: 0,
    total: subtotal + shipping + normalizedServiceFee + tax,
  };
}

async function buildProductCartQuote(userId) {
  const cart = await Cart.findOne({ userId });
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    throw new CheckoutError("Your cart is empty");
  }

  const unsupported = cart.items.find((item) => item.itemType !== "product" || !item.productId);
  if (unsupported) {
    throw new CheckoutError("Products can be checked out here. Book services and venues from their listing pages.");
  }

  const productIds = [...new Set(cart.items.map((item) => String(item.productId)))];
  const products = await Product.find({
    _id: { $in: productIds },
    status: "active",
    isPublished: true,
    isApproved: true,
  });
  if (products.length !== productIds.length) {
    throw new CheckoutError("One or more products are no longer available");
  }

  const productById = new Map(products.map((product) => [String(product._id), product]));
  const items = cart.items.map((cartItem) => {
    const product = productById.get(String(cartItem.productId));
    const quantity = Math.max(1, Math.floor(Number(cartItem.quantity) || 1));
    if (!product || Number(product.stock || 0) < quantity) {
      throw new CheckoutError(`Insufficient stock for ${product?.title || "a product"}`);
    }
    if (["rent", "rental"].includes(String(product.productType))) {
      throw new CheckoutError(`${product.title} is rental-only. Choose rental dates from its detail page.`);
    }

    const variant = cartItem.variant
      ? product.variants?.find((entry) => entry.name === cartItem.variant)
      : null;
    if (variant && Number(variant.stock || 0) < quantity) {
      throw new CheckoutError(`Insufficient stock for ${product.title} (${variant.name})`);
    }

    const unitPrice = Number(variant?.price || product.discountPrice || product.price || 0);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new CheckoutError(`${product.title} does not have a valid sale price`);
    }

    return {
      productId: String(product._id),
      sellerId: String(product.sellerId),
      title: product.title,
      image: product.images?.[0] || "",
      quantity,
      variant: cartItem.variant || "",
      unitPrice,
      shippingCost: product.freeShipping ? 0 : Math.max(0, Number(product.shippingCost) || 0),
    };
  });

  const [serviceFee, taxRate] = await Promise.all([
    getSetting("serviceFee"),
    getSetting("taxRate"),
  ]);

  return {
    cartId: String(cart._id),
    items,
    summary: calculateQuoteTotals(items, serviceFee, taxRate),
  };
}

module.exports = {
  CheckoutError,
  buildProductCartQuote,
  calculateQuoteTotals,
};
