// Reviews written before moderation existed have no status field. They remain
// visible, while newly moderated reviews are controlled by these two fields.
const PUBLIC_REVIEW_FILTER = {
  status: { $in: ["approved", null] },
  isVisible: { $ne: false },
};

function reviewModerationStatus(review) {
  return review?.status || "pending";
}

function formatModerationReview(review, itemType) {
  const source = review?.toObject ? review.toObject() : review || {};
  const user = source.userId && typeof source.userId === "object" ? source.userId : {};

  return {
    _id: source._id,
    itemId: source.itemId || source.productId || null,
    itemType: source.itemType || itemType || "product",
    rating: source.rating,
    title: source.title || "",
    comment: source.comment || source.review || "",
    customerName: source.customerName || user.fullName || user.name || "Anonymous",
    status: reviewModerationStatus(source),
    createdAt: source.createdAt,
  };
}

module.exports = {
  PUBLIC_REVIEW_FILTER,
  reviewModerationStatus,
  formatModerationReview,
};
