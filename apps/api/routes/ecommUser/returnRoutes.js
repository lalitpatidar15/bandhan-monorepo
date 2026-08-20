const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const returnController = require("../../controllers/ecommUser/returnController.js");

/**
 * @swagger
 * /api/returns/create:
 *   post:
 *     summary: Create return request
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               orderId:
 *                 type: string
 *               reason:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Return created successfully
 */
router.post("/create", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), returnController.createReturn);


/**
 * @swagger
 * /api/returns:
 *   get:
 *     summary: Get return requests
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns fetched successfully
 */
router.get("/", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker","seller"), returnController.getReturns);


/**
 * @swagger
 * /api/returns/summary:
 *   get:
 *     summary: Get returns summary
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Return summary fetched successfully
 */
router.get("/summary", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker","seller"), returnController.returnSummary);


/**
 * @swagger
 * /api/returns/approve/{id}:
 *   put:
 *     summary: Approve return request
 *     tags: [Returns]
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
 *         description: Return approved successfully
 */
router.put("/approve/:id", auth, requireRole("admin","seller"), returnController.approveReturn);


/**
 * @swagger
 * /api/returns/reject/{id}:
 *   put:
 *     summary: Reject return request
 *     tags: [Returns]
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
 *         description: Return rejected successfully
 */
router.put("/reject/:id", auth, requireRole("admin","seller"), returnController.rejectReturn);


/**
 * @swagger
 * /api/returns/refund/{id}:
 *   put:
 *     summary: Refund return request
 *     tags: [Returns]
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
 *         description: Return refunded successfully
 */
router.put("/refund/:id", auth, requireRole("admin","seller"), returnController.refundReturn);

module.exports = router;
