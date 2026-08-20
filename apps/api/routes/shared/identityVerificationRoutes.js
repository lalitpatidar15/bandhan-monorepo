const express = require("express");
const auth = require("../../middlewares/auth.js");
const controller = require("../../controllers/shared/identityVerificationController.js");

const router = express.Router();
router.use(auth);
router.get("/", controller.getStatus);
router.post("/digilocker/demo", controller.completeDigiLockerDemo);

module.exports = router;
