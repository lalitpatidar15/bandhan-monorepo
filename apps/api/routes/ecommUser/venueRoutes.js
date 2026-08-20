const router = require("express").Router();
const upload = require("../../middlewares/upload.js");
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const venuecontroller = require("../../controllers/ecommUser/venueController.js");

/**
 * @swagger
 * /api/venues/{id}:
 *   get:
 *     summary: Get venue details
 *     description: Fetch single venue and calculate total price
 *     tags: [Venues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Venue ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venue details fetched successfully
 *       404:
 *         description: Venue not found
 */
router.get("/seller", auth, requireRole("seller", "admin"), venuecontroller.getSellerVenues);

/**
 * @swagger
 * /api/venues/create:
 *   post:
 *     summary: Create a new venue
 *     description: Add venue with multiple images and availability
 *     tags: [Venues]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - pricePerDay
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               rating:
 *                 type: number
 *               reviews:
 *                 type: number
 *               guests:
 *                 type: number
 *               description:
 *                 type: string
 *               pricePerDay:
 *                 type: number
 *               serviceFee:
 *                 type: number
 *               availability:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Venue created successfully
 *       500:
 *         description: Server error
 */
router.post("/create", auth, requireRole("seller", "admin"), upload.array("images", 10), venuecontroller.createVenue);
router.put("/:id", auth, requireRole("seller", "admin"), upload.array("images", 10), venuecontroller.updateVenue);
router.delete("/:id", auth, requireRole("seller", "admin"), venuecontroller.deleteVenue);

/**
 * @swagger
 * /api/venues:
 *   get:
 *     summary: Get all venues list
 *     description: Fetch venue list with pagination and price filter
 *     tags: [Venues]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of items per page
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per day
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per day
 *     responses:
 *       200:
 *         description: Venue list fetched successfully
 */
router.get("/", venuecontroller.getVenueList);
router.get("/:id", venuecontroller.getVenueDetail);

module.exports = router;
