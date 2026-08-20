const express = require("express");
const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");
const controller = require("../../controllers/ecommUser/bookingController.js");

const router = express.Router();
router.use(auth, requireEcommUser);
router.post("/", controller.createBooking);
router.get("/user", controller.getUserBookings);
router.get("/venue/:venueId/available-dates", controller.getAvailableDates);
router.get("/:id", controller.getBooking);
router.patch("/:id", controller.updateBooking);
router.post("/:id/cancel", controller.cancelBooking);

module.exports = router;
