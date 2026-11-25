const express = require("express");
const auth = require("../../middlewares/auth.js");
const upload = require("../../middlewares/upload.js");
const controller = require("../../controllers/shared/identityVerificationController.js");

const router = express.Router();
router.use(auth);
router.get("/", controller.getStatus);
router.post("/digilocker/demo", controller.completeDigiLockerDemo);
router.post(
  "/manual",
  upload.fields([
    { name: "governmentId", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
    { name: "businessProof", maxCount: 1 },
  ]),
  controller.submitManual
);

module.exports = router;
