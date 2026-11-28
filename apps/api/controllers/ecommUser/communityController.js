const Community = require("../../models/shared/Community.js");

const escapedPattern = (value) => new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
const visibleCommunityFilter = { status: { $ne: "draft" }, isActive: { $ne: false } };

exports.getCommunities = async (req, res) => {
  try {
    const filter = { ...visibleCommunityFilter };
    if (req.query.category) {
      filter.category = escapedPattern(req.query.category);
    }
    if (req.query.search) {
      const pattern = escapedPattern(req.query.search);
      filter.$or = [{ name: pattern }, { description: pattern }];
    }

    const communities = await Community.find(filter)
      .populate("members", "fullName name profileImage")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: communities });
  } catch (error) {
    console.error("Error in controllers/ecommUser/communityController.js:", error);
    res.status(500).json({ success: false, message: "Unable to load communities" });
  }
};

exports.getCommunityById = async (req, res) => {
  try {
    const community = await Community.findOne({ _id: req.params.id, ...visibleCommunityFilter })
      .populate("members", "fullName name profileImage")
      .lean();
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    res.json({ success: true, data: community });
  } catch (error) {
    console.error("Error in controllers/ecommUser/communityController.js:", error);
    res.status(500).json({ success: false, message: "Unable to load community" });
  }
};

exports.joinCommunity = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const community = await Community.findOneAndUpdate(
      { _id: req.params.id, ...visibleCommunityFilter },
      { $addToSet: { members: userId } },
      { new: true }
    ).populate("members", "fullName name profileImage");
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    res.json({ success: true, data: community });
  } catch (error) {
    console.error("Error in controllers/ecommUser/communityController.js:", error);
    res.status(500).json({ success: false, message: "Unable to join community" });
  }
};

exports.leaveCommunity = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const community = await Community.findOneAndUpdate(
      { _id: req.params.id, ...visibleCommunityFilter },
      { $pull: { members: userId } },
      { new: true }
    ).populate("members", "fullName name profileImage");
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    res.json({ success: true, data: community });
  } catch (error) {
    console.error("Error in controllers/ecommUser/communityController.js:", error);
    res.status(500).json({ success: false, message: "Unable to leave community" });
  }
};
