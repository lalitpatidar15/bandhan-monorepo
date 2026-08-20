const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const invoiceController = require("../../controllers/ecommUser/invoiceController.js");

router.get("/order/:orderId", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), invoiceController.getInvoiceByOrder);
router.get("/my", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), invoiceController.getUserInvoices);

module.exports = router;
