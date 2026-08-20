const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const chatController = require("../../controllers/ecommUser/chatController.js");

/**
 * @swagger
 * /api/chat/conversation/create:
 *   post:
 *     summary: Create conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conversation created successfully
 */
router.post(
  "/conversation/create",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobseeker"),
  chatController.createConversation
);


/**
 * @swagger
 * /api/chat/conversation:
 *   get:
 *     summary: Get all conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations fetched successfully
 */
router.get(
  "/conversation",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobseeker"),
  chatController.getConversations
);
router.get(
  "/conversations",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobseeker"),
  chatController.getConversations
);


/**
 * @swagger
 * /api/chat/message/{id}:
 *   post:
 *     summary: Send message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post(
  "/message/:id",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobseeker"),
  chatController.sendMessage
);


/**
 * @swagger
 * /api/chat/message/{id}:
 *   get:
 *     summary: Get messages by conversation id
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 */
router.get(
  "/message/:id",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"),
  chatController.getMessages
);


/**
 * @swagger
 * /api/chat/seen/{id}:
 *   put:
 *     summary: Mark customer messages as seen
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as seen
 */
router.put(
  "/seen/:id",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"),
  chatController.markSeen
);

module.exports = router;