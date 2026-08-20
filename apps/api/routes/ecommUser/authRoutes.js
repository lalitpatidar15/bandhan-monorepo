const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload.js");
const User = require("../../models/shared/User.js");

const authController = require("../../controllers/ecommUser/authController.js");
const ecommUserController = require("../../controllers/ecommUser/ecommUserController.js");
const auth = require("../../middlewares/auth.js");

const optionalFileUpload = (fieldName) => (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return upload.single(fieldName)(req, res, next);
  }
  return next();
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user 
 *     description: Create user with email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or missing data
 */
router.post("/register", authController.saveRegistration);

/**
 * @swagger
 * /api/auth/register/{id}:
 *   put:
 *     summary: Complete user registration
 *     description: Add full details and complete profile
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Registration completed
 *       400:
 *         description: Validation error
 */
router.put(
  "/register/:id",
  optionalFileUpload("profileImage"),
  authController.saveRegistration
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Login using email  and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);
router.post("/logout", auth, ecommUserController.logout);
router.post("/sso/exchange", authController.exchangeSsoCode);
router.post("/portal-login", authController.portalLogin);
router.post("/portal-register", authController.portalRegister);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Check if user exists by email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: User not found
 */
/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               purpose:
 *                 type: string
 *                 enum: [general, email-verification, password-reset]
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post("/send-otp", authController.sendOtp);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               purpose:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post("/verify-otp", authController.verifyOtp);

/**
 * @swagger
 * /api/auth/social-login:
 *   post:
 *     summary: Social login with Google/Facebook
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [google, facebook]
 *               socialId:
 *                 type: string
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/social-login", authController.socialLogin);

router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               resetToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @swagger
 * /api/auth/admin-login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    const jwt = require("jsonwebtoken");
    const bcrypt = require("bcryptjs");
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    const user = await User.findOne({
      $or: [
        { email: username.trim().toLowerCase() },
        { username: username.trim().toLowerCase() }
      ],
      role: "admin"
    }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.status === "inactive" || user.status === "blocked") {
      return res.status(403).json({ success: false, message: "Account is suspended" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: "admin", username: user.username || user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username || user.email,
        role: "admin",
        email: user.email
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const { getSettings } = require("../../services/configService.js");

router.get("/platform-settings", async (_req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      success: true,
      data: {
        platformName: settings.platformName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        serviceFee: settings.serviceFee,
        taxRate: settings.taxRate,
        platformFee: settings.platformFee,
        gstRate: settings.gstRate,
        defaultCurrency: settings.defaultCurrency,
        maxUploadSize: settings.maxUploadSize,
        jobPostingFee: settings.jobPostingFee,
        defaultReturnPolicy: settings.defaultReturnPolicy,
        rentalReturnWindowHours: settings.rentalReturnWindowHours,
        paginationLimit: settings.paginationLimit,
      },
    });
  } catch (err) {
    console.error("Error in routes/ecommUser/authRoutes.js:", err);

    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
