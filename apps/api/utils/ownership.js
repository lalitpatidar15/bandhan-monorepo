function getSellerFromReq(req) {
  const sellerId = String(req?.user?.id || req?.user?._id || "").trim();
  const sellerEmail = String(req?.user?.email || "").trim().toLowerCase();
  return { sellerId: sellerId || null, sellerEmail: sellerEmail || null };
}

function getAuthenticatedOwnerId(req) {
  return getSellerFromReq(req).sellerId || "";
}

function isAdmin(req) {
  return String(req?.user?.role || "").toLowerCase() === "admin";
}

function isSeller(req) {
  return String(req?.user?.role || "").toLowerCase() === "seller";
}

function buildOwnerScopeFilter(req, extra = {}) {
  const { sellerId } = getSellerFromReq(req);
  if (isAdmin(req) || !sellerId) {
    return extra;
  }

  return { ...extra, sellerId };
}

function buildOwnerScopeFilterForItems(req, extra = {}) {
  const { sellerId } = getSellerFromReq(req);
  if (isAdmin(req) || !sellerId) {
    return extra;
  }

  return { ...extra, "items.sellerId": sellerId };
}

module.exports = {
  getSellerFromReq,
  getAuthenticatedOwnerId,
  isAdmin,
  isSeller,
  buildOwnerScopeFilter,
  buildOwnerScopeFilterForItems,
};
