const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const blogController = require("../../controllers/ecommUser/blogController.js");

router.get("/", blogController.getBlogs);
router.get("/categories", blogController.getBlogCategories);
router.get("/slug/:slug", blogController.getBlogBySlug);
router.get("/id/:id", blogController.getBlogById);
router.post("/", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), blogController.createBlog);
router.put("/:id", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), blogController.updateBlog);
router.delete("/:id", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), blogController.deleteBlog);

router.post("/:id/like", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), blogController.toggleLike);
router.post("/:id/comments", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), blogController.addComment);
router.delete("/:id/comments/:commentId", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), blogController.deleteComment);

module.exports = router;
