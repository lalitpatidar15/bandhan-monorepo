const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");
const cartController = require("../../controllers/ecommUser/cartController.js");

router.use(auth, requireEcommUser);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: 64ab1234abcd5678
 *               quantity:
 *                 type: number
 *                 example: 2
 *               eventDate:
 *                 type: string
 *                 example: 2026-05-10
 *               guests:
 *                 type: number
 *                 example: 200
 *               packageType:
 *                 type: string
 *                 example: premium
 *     responses:
 *       200:
 *         description: Item added to cart
 */
router.post("/add", auth, cartController.addToCart);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart data
 */
router.get("/", auth, cartController.getCart);

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - quantity
 *             properties:
 *               serviceId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart updated
 */
router.put("/update", auth, cartController.updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{serviceId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete("/remove/venue/:venueId", auth, cartController.removeFromCart);
router.delete("/remove/product/:productId", auth, cartController.removeFromCart);
router.delete("/remove/service/:serviceId", auth, cartController.removeFromCart);
router.delete("/remove/:serviceId", auth, cartController.removeFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete("/clear", auth, cartController.clearCart);

/**
 * @swagger
 * /api/cart/create:
 *   post:
 *     summary: Create booking from cart
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking created
 */
router.post("/create", auth, cartController.createBooking);


/**
 * @swagger
 * /api/cart/checkout/{id}:
 *   put:
 *     summary: Checkout booking
 *     tags: [Booking]
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
 *             required:
 *               - fullAddress
 *               - city
 *               - pincode
 *               - paymentMethod
 *             properties:
 *               fullAddress:
 *                 type: string
 *               city:
 *                 type: string
 *               pincode:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 example: COD
 *     responses:
 *       200:
 *         description: Checkout completed
 */
router.put("/checkout/:id", auth, cartController.checkoutBooking);


/**
 * @swagger
 * /api/cart/success/{id}:
 *   get:
 *     summary: Get booking success details
 *     tags: [Booking]
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
 *         description: Booking details
 */
router.get("/success/:id", auth, cartController.getBookingSuccess);


/**
 * @swagger
 * /api/cart/tracking/{id}:
 *   get:
 *     summary: Track order status
 *     tags: [Booking]
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
 *         description: Order tracking details
 */
router.get("/tracking/:id", auth, cartController.getOrderTracking);



module.exports = router;
