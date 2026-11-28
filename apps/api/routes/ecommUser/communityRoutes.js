const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.js");
const communityController = require("../../controllers/ecommUser/communityController.js");

router.get("/", communityController.getCommunities);
router.get("/:id", communityController.getCommunityById);
router.post("/:id/join", auth, communityController.joinCommunity);
router.delete("/:id/leave", auth, communityController.leaveCommunity);

module.exports = router;
