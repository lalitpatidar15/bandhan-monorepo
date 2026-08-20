const express = require("express");
const { rateLimit } = require("express-rate-limit");
const router = express.Router();
const publicController = require("../../controllers/public/publicController.js");

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many subscription attempts. Please try again later." },
});

router.get("/jobs", publicController.getPublicJobs);
router.get("/landing-catalog", publicController.getLandingCatalogue);
router.get("/marketplace-search", publicController.searchMarketplace);
router.post("/newsletter", express.json({ limit: "10kb" }), newsletterLimiter, publicController.subscribeNewsletter);
router.get("/catalog/:type/:id", publicController.getPublicCatalogueDetail);
router.get("/catalog/:type", publicController.getPublicCatalogue);

module.exports = router;
