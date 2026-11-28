const Inspiration = require("../../models/shared/Inspiration.js");

const escapedPattern = (value) => new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

exports.getInspiration = async (req, res) => {
  try {
    const filter = { isActive: { $ne: false } };
    if (req.query.category) {
      filter.category = escapedPattern(req.query.category);
    }
    if (req.query.search) {
      const pattern = escapedPattern(req.query.search);
      filter.$or = [
        { title: pattern },
        { description: pattern },
        { tags: pattern },
      ];
    }

    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 12;
    const stories = await Inspiration.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: stories });
  } catch (error) {
    console.error("Error in controllers/ecommUser/inspirationController.js:", error);
    res.status(500).json({ success: false, message: "Unable to load inspiration stories" });
  }
};
