const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const earningController = require("../../controllers/ecommUser/earningController.js");

/**
 * @swagger
 * /api/earnings/create:
 *   post:
 *     summary: Create earning transaction
 *     tags: [Earnings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               commission:
 *                 type: number
 *               gst:
 *                 type: number
 *               paymentGatewayFee:
 *                 type: number
 *               discounts:
 *                 type: number
 *               status:
 *                 type: string
 *               transactionDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction created successfully
 *       500:
 *         description: Server error
 */
router.post("/create", auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"), earningController.createTransaction);


/**
 * @swagger
 * /api/earnings/summary:
 *   get:
 *     summary: Get earnings summary
 *     tags: [Earnings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary fetched successfully
 */
router.get("/summary", auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"), earningController.getSummary);


/**
 * @swagger
 * /api/earnings/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Earnings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions fetched successfully
 */
router.get("/transactions", auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"), earningController.getTransactions);


/**
 * @swagger
 * /api/earnings/chart:
 *   get:
 *     summary: Get revenue chart
 *     tags: [Earnings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue chart fetched successfully
 */
router.get("/chart", auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"), earningController.getRevenueChart);


/**
 * @swagger
 * /api/earnings/breakdown/{id}:
 *   get:
 *     summary: Get commission breakdown
 *     tags: [Earnings]
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
 *         description: Commission breakdown fetched successfully
 */
router.get(
  "/breakdown/:id",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"),
  earningController.getCommissionBreakdown
);


/**
 * @swagger
 * /api/earnings/withdraw:
 *   post:
 *     summary: Submit withdrawal request
 *     tags: [Earnings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Withdrawal request submitted
 */
router.post("/withdraw", auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"), earningController.withdraw);

module.exports = router;