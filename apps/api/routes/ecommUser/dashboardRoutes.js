const express = require("express");
const router = express.Router();

const dashboardcontroller = require("../../controllers/ecommUser/dashboardController.js");
const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");

router.use(auth, requireEcommUser);

/**
 * @swagger
 * /api/dashboard/create:
 *   post:
 *     summary: Create dashboard data
 *     tags: [Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Dashboard created
 *       500:
 *         description: Server error
 */
router.post("/create", dashboardcontroller.createDashboard);


/**
 * @swagger
 * /api/dashboard/marketplace:
 *   get:
 *     summary: Get marketplace dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Marketplace dashboard fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     welcome:
 *                       type: string
 *                     featured:
 *                       type: array
 *                       items:
 *                         type: object
 *                     recent:
 *                       type: array
 *                       items:
 *                         type: object
 *                     banner:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.get("/marketplace", dashboardcontroller.getMarketplaceDashboard);

router.get("/buyer", dashboardcontroller.getBuyerDashboard);


/**
 * @swagger
 * /api/dashboard/{userId}:
 *   get:
 *     summary: Get dashboard by userId
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dashboard fetched
 *       500:
 *         description: Server error
 */
router.get("/:userId", dashboardcontroller.getDashboard);


/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                     totalOrders:
 *                       type: number
 *                     pendingOrders:
 *                       type: number
 *                     rating:
 *                       type: number
 *                 revenueAnalytics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                       amount:
 *                         type: number
 *                 recentOrders:
 *                   type: array
 *                   items:
 *                     type: object
 *                 topServices:
 *                   type: array
 *                   items:
 *                     type: object
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get("/", dashboardcontroller.getDashboardOverview);

module.exports = router;
