const express = require("express");
const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");
const controller = require("../../controllers/ecommUser/eventController.js");

const router = express.Router();
router.use(auth, requireEcommUser);
router.post("/", controller.createEvent);
router.get("/user", controller.getEvents);
router.get("/:id", controller.getEvent);
router.patch("/:id", controller.updateEvent);
router.delete("/:id", controller.deleteEvent);
router.post("/:id/vendors", controller.addVendor);
router.delete("/:id/vendors/:vendorId", controller.removeVendor);
router.post("/:id/venues", controller.addVenue);
router.delete("/:id/venues/:venueId", controller.removeVenue);

module.exports = router;
