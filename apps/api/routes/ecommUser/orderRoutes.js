const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");

const orderController = require("../../controllers/ecommUser/orderController.js");

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               service:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order created successfully
 */

// 1. BASE & STATIC ROUTES
router.post("/", auth, requireRole("seller","buyer","admin","eventOwner","learner","jobSeeker"), orderController.createOrder);
router.post("/user-order", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), orderController.createUserOrder);
router.get("/stats", auth, requireRole("seller","buyer","admin","eventOwner","learner","jobSeeker"), orderController.getOrderStats);
router.get("/", auth, requireRole("seller","buyer","admin","eventOwner","learner","jobSeeker"), orderController.getOrders);

// 2. SHIPPING ROUTES (Must be above /:id)
router.post("/shipping", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker","seller"), orderController.createShipment);
router.get("/shipping/stats", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker","seller"), orderController.getShippingStats);
router.get("/shipping", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker","seller"), orderController.getShipments);
router.get("/shipping/track/:orderId", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker","seller"), orderController.trackShipment);
router.get("/shipping/label/:orderId", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker","seller"), orderController.generateLabel);
router.put("/shipping/:id", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker","seller"), orderController.updateShipment);

// 3. TRACKING SPECIFIC ROUTES (Must be above GET /:id)
// Agar tracking fetch karne ke liye GET route chahiye:
router.get("/:id/tracking", auth, requireRole("seller","buyer","admin","eventOwner","learner","jobSeeker","seller"), orderController.refreshOrderTracking); 
router.post("/:id/tracking/refresh", auth, requireRole("seller","buyer","admin","eventOwner","learner","jobSeeker","seller"), orderController.refreshOrderTracking);

// 4. GENERAL DYNAMIC ROUTES (Dhyan rakhein ki ye humesha SABSE NEECHE rahein)
router.get("/:id", auth, requireRole("seller","buyer","admin","eventOwner","learner","jobSeeker","seller"), orderController.getOrderById);
router.put("/:id", auth, requireRole("seller","buyer","admin","eventOwner","learner","jobSeeker"), orderController.updateOrder);

module.exports = router;
