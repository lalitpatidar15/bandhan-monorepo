const Quote = require("../../models/shared/Quote.js");
const Conversation = require("../../models/shared/Conversation.js");

exports.getSellerQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ sellerId: req.user.id })
      .populate("serviceId", "title image category price")
      .populate("venueId", "name images location price")
      .populate("productId", "name title images price")
      .populate("userId", "fullName email profilePic")
      .sort({ createdAt: -1 });

    const quoteIds = quotes.map((quote) => quote._id);
    const conversations = await Conversation.find({
      sellerId: req.user.id,
      quoteId: { $in: quoteIds },
    }).select("_id quoteId buyerId buyerName");

    const conversationByQuote = new Map(
      conversations.map((conversation) => [String(conversation.quoteId), conversation])
    );

    res.json({
      success: true,
      data: quotes.map((quote) => ({
        ...quote.toObject(),
        conversationId: conversationByQuote.get(String(quote._id))?._id || null,
        conversationBuyerName: conversationByQuote.get(String(quote._id))?.buyerName || "",
      })),
    });
  } catch (error) {
    console.error("Error fetching seller quotes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch seller quotes." });
  }
};

exports.approveQuote = async (req, res) => {
  try {
    const quote = await Quote.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user.id },
      { status: "approved" },
      { new: true }
    );
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    await Conversation.updateMany(
      { quoteId: quote._id },
      { status: "approved", quoteStatus: "approved" }
    );

    res.json({ success: true, message: "Quote approved", data: quote });
  } catch (error) {
    console.error("Error approving quote:", error);
    res.status(500).json({ success: false, message: "Failed to approve quote." });
  }
};

exports.rejectQuote = async (req, res) => {
  try {
    const quote = await Quote.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user.id },
      { status: "rejected" },
      { new: true }
    );
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    await Conversation.updateMany(
      { quoteId: quote._id },
      { status: "rejected", quoteStatus: "rejected" }
    );

    res.json({ success: true, message: "Quote rejected", data: quote });
  } catch (error) {
    console.error("Error rejecting quote:", error);
    res.status(500).json({ success: false, message: "Failed to reject quote." });
  }
};

exports.markReplied = async (req, res) => {
  try {
    const quote = await Quote.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user.id },
      { status: "replied" },
      { new: true }
    );
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }
    res.json({ success: true, message: "Quote marked replied", data: quote });
  } catch (error) {
    console.error("Error marking quote replied:", error);
    res.status(500).json({ success: false, message: "Failed to mark quote replied." });
  }
};