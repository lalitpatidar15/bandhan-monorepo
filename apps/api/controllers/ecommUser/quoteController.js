const Quote = require("../../models/shared/Quote.js");

exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ user: req.user.id });
    res.json(quotes);
  } catch (err) {
    console.error("Error in controllers/ecommUser/quoteController.js:", err);

    res.status(500).json({ message: "Failed to process quote request" });
  }
};

exports.approveQuote = async (req, res) => {
  try {
    await Quote.findByIdAndUpdate(req.params.id, { status: "approved" });
    res.json({ message: "Quote approved" });
  } catch (err) {
    console.error("Error in controllers/ecommUser/quoteController.js:", err);

    res.status(500).json({ message: "Failed to process quote request" });
  }
};

exports.rejectQuote = async (req, res) => {
  try {
    await Quote.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.json({ message: "Quote rejected" });
  } catch (err) {
    console.error("Error in controllers/ecommUser/quoteController.js:", err);

    res.status(500).json({ message: "Failed to process quote request" });
  }
};