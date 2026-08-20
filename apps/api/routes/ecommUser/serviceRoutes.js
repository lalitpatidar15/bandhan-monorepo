const express = require("express");
const router = express.Router();

// Middlewares
const auth = require("../../middlewares/auth.js");
// Safe extraction in case auth exports differently
const protectSeller = auth.protectSeller || auth.protect || auth; 
const { requireRole } = require("../../middlewares/role.js");
const upload = require("../../middlewares/upload.js");

// Controller Import
const serviceController = require("../../controllers/ecommUser/serviceController.js");

const allowedRoles = ["seller", "admin"];

// Defensive check to prevent server crash if any controller is missing
const safeHandler = (handlerName) => {
  if (typeof serviceController[handlerName] === "function") {
    return serviceController[handlerName];
  }
  console.error(`❌ ERROR: Controller function '${handlerName}' is missing in serviceController.js`);
  return (req, res) => res.status(500).json({ success: false, message: `Handler '${handlerName}' not implemented.` });
};

/* =========================================================
   PUBLIC / GENERAL SERVICE ROUTES
   ========================================================= */

// GET /api/services
router.get("/", safeHandler("getServices"));

// GET /api/services/categories
router.get("/categories", safeHandler("getServiceCategories"));

// GET /api/services/seller (Must be defined BEFORE /:id to prevent route matching issue)
router.get(
  "/seller",
  protectSeller,
  requireRole(...allowedRoles),
  safeHandler("getSellerServices")
);

// GET /api/services/:id
router.get("/:id", safeHandler("getServiceById"));

/* =========================================================
   PROTECTED SELLER / ADMIN ROUTES
   ========================================================= */

// POST /api/services/create
router.post(
  "/create",
  protectSeller,
  requireRole(...allowedRoles),
  upload.array("images", 5),
  safeHandler("createService")
);

// PUT /api/services/:id
router.put(
  "/:id",
  protectSeller,
  requireRole(...allowedRoles),
  upload.array("images", 5),
  safeHandler("updateService")
);

// DELETE /api/services/:id
router.delete(
  "/:id",
  protectSeller,
  requireRole(...allowedRoles),
  safeHandler("deleteService")
);

module.exports = router;