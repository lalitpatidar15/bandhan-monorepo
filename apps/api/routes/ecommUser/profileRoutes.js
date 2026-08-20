const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const { requireRole } = require("../../middlewares/role.js");
const upload = require("../../middlewares/upload");
const profileController = require("../../controllers/ecommUser/profileController");

/**
 * @swagger
 * /api/profile/basic-info:
 *   post:
 *     summary: Save basic profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Basic info saved successfully
 *       500:
 *         description: Server error
 */
router.post(
  "/basic-info",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"),
  upload.single("profilePhoto"),
  profileController.saveBasicInfo
);


/**
 * @swagger
 * /api/profile/business-details:
 *   post:
 *     summary: Save business details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               businessCategory:
 *                 type: string
 *               businessAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Business details saved successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.post(
  "/business-details",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"),
  profileController.saveBusinessDetails
);

router.post(
  "/settings",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"),
  profileController.saveSettings
);

/**
 * @swagger
 * /api/profile/verify-id:
 *   post:
 *     summary: Verify government ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               governmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Government ID verified successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.post(
  "/verify-id",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"),
  profileController.verifyGovernmentId
);


/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  auth, requireRole("buyer","seller","admin","eventOwner","learner","jobSeeker"),
  profileController.getProfile
);

module.exports = router;