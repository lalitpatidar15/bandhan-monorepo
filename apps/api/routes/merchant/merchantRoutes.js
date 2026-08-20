const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const upload = require("../../middlewares/upload.js");
const merchantController = require("../../controllers/merchant/merchantController.js");

/**
 * @swagger
 * /api/merchant/save:
 *   post:
 *     summary: Save merchant profile
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Merchant profile saved successfully
 */
router.post(
  "/save",
  auth, requireRole("buyer", "seller"),
  upload.single("profilePhoto"),
  merchantController.saveProfile
);


/**
 * @swagger
 * /api/merchant:
 *   get:
 *     summary: Get merchant settings
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchant settings fetched successfully
 */
router.get(
  "/",
  auth, requireRole("buyer", "seller"),
  merchantController.getSettings
);


/**
 * @swagger
 * /api/merchant/toggle-2fa:
 *   put:
 *     summary: Toggle two factor authentication
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Two factor authentication updated successfully
 */
router.put(
  "/toggle-2fa",
  auth, requireRole("buyer", "seller"),
  merchantController.toggle2FA
);


/**
 * @swagger
 * /api/merchant/preferences:
 *   put:
 *     summary: Update merchant preferences
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderAlerts:
 *                 type: boolean
 *               stockUpdates:
 *                 type: boolean
 *               marketingEmails:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put(
  "/preferences",
  auth, requireRole("buyer", "seller"),
  merchantController.updatePreferences
);


/**
 * @swagger
 * /api/merchant/change-password:
 *   put:
 *     summary: Change merchant password
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.put(
  "/change-password",
  auth, requireRole("buyer", "seller"),
  merchantController.changePassword
);


/**
 * @swagger
 * /api/merchant/merchant-health:
 *   get:
 *     summary: Get merchant health
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchant health fetched successfully
 */
router.get(
  "/merchant-health",
  auth, requireRole("buyer", "seller"),
  merchantController.getMerchantHealth
);

module.exports = router;