function buildConversationQuoteContext({ quote }) {
  const safeQuote = quote || {};
  return {
    quoteId: safeQuote._id ? String(safeQuote._id) : "",
    quoteStatus: safeQuote.status || "",
    quoteEventDate: safeQuote.eventDate || "",
    quoteGuestRange: safeQuote.guestRange || "",
    quoteBudget: safeQuote.budget || 0,
    quoteServices: Array.isArray(safeQuote.services) ? safeQuote.services.filter(Boolean) : [],
    quoteNote: safeQuote.note || "",
    quoteFullName: safeQuote.fullName || "",
    quotePhone: safeQuote.phone || "",
    quoteEmail: safeQuote.email || "",
    quoteListingType: safeQuote.listingType || safeQuote.serviceType || safeQuote.type || "",
  };
}

module.exports = {
  buildConversationQuoteContext,
};
