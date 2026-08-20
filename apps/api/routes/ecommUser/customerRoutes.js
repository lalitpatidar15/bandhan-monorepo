const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const requireEcommUser = require("../../middlewares/requireEcommUser");
const controller = require("../../controllers/ecommUser/customerController");

router.use(auth, requireEcommUser);

// Enquiries
router.post("/enquiries", controller.createEnquiry);
router.get("/enquiries", controller.getEnquiries);

// Addresses
router.get("/addresses", controller.getAddresses);
router.post("/addresses", controller.createAddress);
router.put("/addresses/:id", controller.updateAddress);
router.delete("/addresses/:id", controller.deleteAddress);

// Support tickets
router.post("/support", controller.createTicket);
router.get("/support", controller.getTickets);

module.exports = router;
