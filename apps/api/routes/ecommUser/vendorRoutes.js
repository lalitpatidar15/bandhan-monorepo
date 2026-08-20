const express = require("express");
const controller = require("../../controllers/ecommUser/vendorController.js");

const router = express.Router();
router.get("/", controller.listVendors);
router.get("/search", controller.listVendors);
router.get("/category/:category", (req, _res, next) => { req.query.category = req.params.category; next(); }, controller.listVendors);
router.get("/featured", (req, _res, next) => { req.query.featured = "true"; next(); }, controller.listVendors);
router.get("/:id", controller.getVendor);

module.exports = router;
