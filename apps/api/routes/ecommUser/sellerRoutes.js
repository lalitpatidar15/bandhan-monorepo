const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const inventoryController = require("../../controllers/ecommUser/inventoryController");
const orderController = require("../../controllers/ecommUser/orderController.js");
const productController = require("../../controllers/ecommUser/productController.js");const sellerQuoteController = require("../../controllers/ecommUser/sellerQuoteController.js");
const sellerRoles = ["seller", "admin"];

router.get("/dashboard-stats", auth, requireRole(...sellerRoles), inventoryController.getInventoryStats);
router.get("/products", auth, requireRole(...sellerRoles), productController.getSellerProducts);
router.get("/orders", auth, requireRole(...sellerRoles), orderController.getOrders);
router.get("/orders/stats", auth, requireRole(...sellerRoles), orderController.getOrderStats);
router.get("/quotes", auth, requireRole(...sellerRoles), sellerQuoteController.getSellerQuotes);
router.put("/quotes/:id/approve", auth, requireRole(...sellerRoles), sellerQuoteController.approveQuote);
router.put("/quotes/:id/reject", auth, requireRole(...sellerRoles), sellerQuoteController.rejectQuote);
router.put("/quotes/:id/replied", auth, requireRole(...sellerRoles), sellerQuoteController.markReplied);

module.exports = router;
