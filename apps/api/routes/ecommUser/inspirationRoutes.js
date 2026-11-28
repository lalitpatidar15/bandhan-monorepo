const express = require("express");
const router = express.Router();
const inspirationController = require("../../controllers/ecommUser/inspirationController.js");

router.get("/", inspirationController.getInspiration);

module.exports = router;
