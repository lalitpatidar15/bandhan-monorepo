const express = require("express");
const controller = require("../../controllers/ecommUser/catalogController.js");

const router = express.Router();

router.get("/config", controller.getCatalogConfig);

module.exports = router;
