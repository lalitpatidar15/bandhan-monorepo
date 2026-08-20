const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const upload = require("../../middlewares/upload.js");
const userController = require("../../controllers/ecommUser/userController.js");
const ecommUserController = require("../../controllers/ecommUser/ecommUserController.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");

/**
 * @swagger
 * /api/user/create-quote:
 *   post:
 *     summary: Create a new quote request
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *               eventDate:
 *                 type: string
 *               location:
 *                 type: string
 *               guestRange:
 *                 type: string
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *               budget:
 *                 type: number
 *               isBudgetFlexible:
 *                 type: boolean
 *               note:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quote request created successfully
 */
router.post("/create-quote", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), userController.createQuote);
router.get("/quotes", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), userController.getMyQuotes);
router.get("/my-quotes", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), userController.getMyQuotes);


/**
 * @swagger
 * /api/user/select-path:
 *   post:
 *     summary: Select user path
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User path selected successfully
 */
router.post("/select-path", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), userController.userPath);

// Authenticated e-commerce account settings. These routes must be declared
// before /:id so names such as "profile" are not treated as user IDs.
router.get("/profile", auth, requireEcommUser, ecommUserController.getProfile);
router.patch("/profile", auth, requireEcommUser, ecommUserController.updateProfile);
router.post("/password", auth, requireEcommUser, ecommUserController.changePassword);
router.get("/preferences", auth, requireEcommUser, ecommUserController.getPreferences);
router.patch("/preferences", auth, requireEcommUser, ecommUserController.updatePreferences);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
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
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put("/:id", auth, userController.updateUser);

module.exports = router;
