const Banner = require("../../models/shared/Banner.js");

exports.createBanner = async (req, res) => {
  try {
    const image = req.file ? req.file.path : "";

    const banner = await Banner.create({
      title: req.body.title,
      subtitle: req.body.subtitle,
      buttonText: req.body.buttonText,
      link: req.body.link,
      isActive: req.body.isActive !== "false",
      image
    });

    res.json({
      success: true,
      data: banner
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/bannerController.js:", err);

    res.status(500).json({
      success: false,
      message: "Failed to process banner request"
    });
  }
};

exports.getBanner = async (req, res) => {
  const banner = await Banner.findOne({ isActive: { $ne: false } }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: banner || {}
  });
};
