const express = require("express");
const router = express.Router();

const postController = require("../../controllers/ecommUser/postController.js");
const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");

/**
 * @swagger
 * /api/post/create:
 *   post:
 *     summary: Create post
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               video:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post created successfully
 */
router.post("/create", auth, requireEcommUser, postController.createPost);


/**
 * @swagger
 * /api/post/feed:
 *   get:
 *     summary: Get post feed
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Feed fetched successfully
 */
router.get("/feed", postController.getFeed);


/**
 * @swagger
 * /api/post/like:
 *   post:
 *     summary: Like or unlike post
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post like updated successfully
 */
router.post("/like", auth, requireEcommUser, postController.toggleLike);


/**
 * @swagger
 * /api/post/share:
 *   post:
 *     summary: Share post
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post shared successfully
 */
router.post("/share", auth, requireEcommUser, postController.sharePost);


/**
 * @swagger
 * /api/post/add:
 *   post:
 *     summary: Add comment
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               userId:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added successfully
 */
router.post("/add", auth, requireEcommUser, postController.addComment);


/**
 * @swagger
 * /api/post/{postId}:
 *   get:
 *     summary: Get comments by post id
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comments fetched successfully
 */
router.get("/:postId", postController.getComments);

module.exports = router;
