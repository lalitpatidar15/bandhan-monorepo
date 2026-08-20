const Product = require("../models/shared/Product.js");
const Order = require("../models/shared/Order.js");
const mongoose = require("mongoose");

/**
 * Check if a product has ever been part of any customer order.
 * @param {string} productId - The product's ObjectId
 * @returns {boolean} - True if the product exists in any order
 */
async function hasProductBeenOrdered(productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) return false;

  const count = await Order.countDocuments({
    "items.productId": productId,
  });

  return count > 0;
}

/**
 * Check if a product has pending/confirmed orders (not completed/cancelled).
 * @param {string} productId - The product's ObjectId
 * @returns {boolean} - True if product has active orders
 */
async function hasActiveOrders(productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) return false;

  const count = await Order.countDocuments({
    "items.productId": productId,
    orderStatus: { $in: ["pending", "confirmed"] },
  });

  return count > 0;
}

/**
 * Safely delete a product, handling orders that reference it.
 *
 * Business logic:
 * - If product has NEVER been ordered: hard delete (remove from DB).
 * - If product has been ordered but has no active/pending/confirmed orders:
 *   soft-delete (set status to "deleted", unpublish).
 * - If product has active orders: soft-delete + warn (cannot hard-delete
 *   because order history needs the product reference).
 *
 * @param {string} productId - The product's ObjectId
 * @param {string} userId - The requesting user's ID (for ownership check)
 * @returns {object} - { action: "hard-deleted"|"soft-deleted"|"not-found"|"unauthorized", product: object|null }
 */
async function safeDeleteProduct(productId, userId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return { action: "invalid-id", product: null };
  }

  const product = await Product.findById(productId);
  if (!product) {
    return { action: "not-found", product: null };
  }

  // Check ownership (caller should also verify this, but double-check)
  if (String(product.sellerId) !== String(userId)) {
    return { action: "unauthorized", product: null };
  }

  const hasBeenOrdered = await hasProductBeenOrdered(productId);

  if (!hasBeenOrdered) {
    // Product has never been ordered — safe to hard delete
    await Product.findByIdAndDelete(productId);
    return { action: "hard-deleted", product };
  }

  // Product exists in order history — soft delete
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        status: "deleted",
        isPublished: false,
        isApproved: false,
        stock: 0,
        stockStatus: "out_of_stock",
      },
    },
    { new: true }
  );

  return {
    action: "soft-deleted",
    product: updatedProduct,
  };
}

module.exports = {
  safeDeleteProduct,
  hasProductBeenOrdered,
  hasActiveOrders,
};
