const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const activityController = require("../../controllers/ecommUser/activityController.js");

/**
 * @swagger
 * /api/activity/add:
 *   post:
 *     summary: Add product to recent activity
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added to recent activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */
router.post("/add", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), activityController.addRecent);

/**
 * @swagger
 * /api/activity:
 *   get:
 *     summary: Get recent viewed products
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       productId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           price:
 *                             type: number
 *                       createdAt:
 *                         type: string
 */
router.get("/", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), activityController.getRecent);

module.exports = router;