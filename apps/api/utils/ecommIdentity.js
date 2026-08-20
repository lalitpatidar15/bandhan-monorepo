function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function resolveBuyerIdentity(payload = {}, user = {}) {
  const name = normalizeText(payload.customerName || payload.buyerName || payload.name || user.fullName || user.name || user.nameEn || "");
  const email = normalizeText(payload.customerEmail || payload.buyerEmail || payload.email || user.email || "");

  return {
    name: name || "Guest Customer",
    email: email || "",
  };
}

function resolveSellerIdentity(payload = {}, user = {}) {
  const name = normalizeText(payload.sellerName || payload.seller?.name || payload.seller?.fullName || user.fullName || user.name || user.nameEn || "");
  const email = normalizeText(payload.sellerEmail || payload.seller?.email || user.email || "");

  return {
    name: name || "Verified Seller",
    email: email || "",
  };
}

module.exports = {
  resolveBuyerIdentity,
  resolveSellerIdentity,
};
