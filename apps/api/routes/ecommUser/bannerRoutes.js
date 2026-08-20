const express = require("express");
const router = express.Router();

const upload = require("../../middlewares/upload.js");
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const bannerController = require("../../controllers/ecommUser/bannerController.js");

/**
 * @swagger
 * /api/banner/create:
 *   post:
 *     summary: Create banner
 *     tags: [Banner]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               buttonText:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Banner created successfully
 *       500:
 *         description: Server error
 */
router.post("/create", auth, requireRole("admin"), upload.single("image"), bannerController.createBanner);

/**
 * @swagger
 * /api/banner:
 *   get:
 *     summary: Get latest banner
 *     tags: [Banner]
 *     responses:
 *       200:
 *         description: Banner fetched successfully
 */
router.get("/", bannerController.getBanner);

module.exports = router;
