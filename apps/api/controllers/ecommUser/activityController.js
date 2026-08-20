const Activity = require("../../models/shared/Activity.js");

// ADD RECENT VIEW
exports.addRecent = async (req, res) => {
  const { productId } = req.body;

  await Activity.create({
    userId: req.user.id,
    productId
  });

  res.json({ success: true });
};

// GET RECENT
exports.getRecent = async (req, res) => {
  const data = await Activity.find({ userId: req.user.id })
    .populate("productId")
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({ success: true, data });
};