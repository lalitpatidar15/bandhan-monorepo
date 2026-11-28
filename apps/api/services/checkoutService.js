const Cart = require("../models/shared/Cart.js");
const Product = require("../models/shared/Product.js");
const { getSetting } = require("./configService.js");
const { calculateCommission } = require("./commissionService.js");

class CheckoutError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "CheckoutError";
    this.statusCode = statusCode;
  }
}

function calculateQuoteTotals(items, serviceFee, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = items.reduce((sum, item) => sum + (Number(item.shippingCost) || 0) * item.quantity, 0);
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
    const productType = String(product?.productType || product?.type || "").toLowerCase();
    const isRentalOnly = ["rent", "rental"].includes(productType);

    if (isRentalOnly) {
      const available = Number(product.rentalStock || product.stock || 0);
      if (!product || available < quantity) {
        throw new CheckoutError(`Insufficient rental stock for ${product?.title || "a product"}`);
      }
      const unitPrice = Number(product.rentalPrice || product.rentPrice || 0);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        throw new CheckoutError(`${product.title} does not have a valid rental price`);
      }
      const deposit = Math.max(0, Number(product.securityDeposit) || 0);
      return {
        productId: String(product._id),
        sellerId: String(product.sellerId),
        title: product.title,
        image: product.images?.[0] || "",
        quantity,
        variant: cartItem.variant || "",
        unitPrice,
        shippingCost: product.freeShipping ? 0 : Math.max(0, Number(product.shippingCost) || 0),
        securityDeposit: deposit,
        itemType: "rental",
      };
    }

    if (!product || Number(product.stock || 0) < quantity) {
      throw new CheckoutError(`Insufficient stock for ${product?.title || "a product"}`);
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
      securityDeposit: 0,
      itemType: "product",
    };
  });

  const [serviceFee, taxRate] = await Promise.all([
    getSetting("serviceFee"),
    getSetting("taxRate"),
  ]);

  // Commission is recorded separately from the buyer-facing total: it is a
  // platform/vendor split, not an extra charge on the quote.
  const commissions = await Promise.all(items.map((item) =>
    calculateCommission(productById.get(item.productId)?.category, item.unitPrice * item.quantity)
  ));
  items.forEach((item, index) => {
    item.category = productById.get(item.productId)?.category || "";
    item.commissionRate = commissions[index].rate;
    item.commission = commissions[index].commission;
    item.net = commissions[index].net;
  });
  const commission = Math.round(items.reduce((sum, item) => sum + item.commission, 0) * 100) / 100;

  const summary = calculateQuoteTotals(items, serviceFee, taxRate);
  const securityDeposit = items.reduce((sum, item) => sum + (Number(item.securityDeposit) || 0) * item.quantity, 0);
  summary.securityDeposit = securityDeposit;
  summary.total = summary.total + securityDeposit;

  return {
    cartId: String(cart._id),
    items,
    commission,
    summary,
  };
}

module.exports = {
  CheckoutError,
  buildProductCartQuote,
  calculateQuoteTotals,
};
