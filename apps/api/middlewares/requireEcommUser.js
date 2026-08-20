const User = require("../models/shared/User.js");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select("_id role").lean();
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "An e-commerce user account is required",
      });
    }

    req.user.role = user.role;
    next();
  } catch (error) {
    console.error("Error in middlewares/requireEcommUser.js:", error);

    next(error);
  }
};
