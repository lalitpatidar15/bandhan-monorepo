const router = require("express").Router();
const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");
const Quote = require("../../models/shared/Quote.js");
const Conversation = require("../../models/shared/Conversation.js");

router.use(auth, requireEcommUser);

router.get("/", async (req, res) => {
  const quotes = await Quote.find({ userId: req.user.id })
    .populate("serviceId", "title image category")
    .populate("venueId", "name images location")
    .populate("productId", "name title images")
    .sort({ createdAt: -1 });
  const quoteIds = quotes.map((quote) => quote._id);
  const conversations = await Conversation.find({
    buyerId: req.user.id,
    quoteId: { $in: quoteIds },
  }).select("_id quoteId sellerId sellerName");
  const conversationByQuote = new Map(
    conversations.map((conversation) => [String(conversation.quoteId), conversation])
  );

  res.json({
    success: true,
    data: quotes.map((quote) => ({
      ...quote.toObject(),
      conversationId: conversationByQuote.get(String(quote._id))?._id || null,
      conversationSellerName: conversationByQuote.get(String(quote._id))?.sellerName || "",
    })),
  });
});

router.get("/:id", async (req, res) => {
  const quote = await Quote.findOne({ _id: req.params.id, userId: req.user.id })
    .populate("serviceId", "title image category location")
    .populate("venueId", "name images location")
    .populate("productId", "name title images");
  if (!quote) return res.status(404).json({ success: false, message: "Quote not found" });
  const conversation = await Conversation.findOne({
    buyerId: req.user.id,
    quoteId: quote._id,
  }).select("_id sellerId sellerName");
  res.json({
    success: true,
    data: {
      ...quote.toObject(),
      conversationId: conversation?._id || null,
      conversationSellerName: conversation?.sellerName || "",
    },
  });
});

router.put("/:id/approve", async (req, res) => {
  const quote = await Quote.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { status: "approved" },
    { new: true }
  );
  if (!quote) return res.status(404).json({ message: "Quote not found" });
  res.json({ message: "Approved" });
});

router.put("/:id/reject", async (req, res) => {
  const quote = await Quote.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { status: "rejected" },
    { new: true }
  );
  if (!quote) return res.status(404).json({ message: "Quote not found" });
  res.json({ message: "Rejected" });
});

module.exports = router;
