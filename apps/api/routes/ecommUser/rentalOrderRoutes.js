const router = require("express").Router();
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const rentalOrderController = require("../../controllers/ecommUser/rentalOrderController.js");

router.post("/create", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.createRentalOrder);
router.get("/", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.getMyRentals);
router.get("/seller", auth, requireRole("seller","buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.getSellerRentals);
router.get("/availability/:productId", rentalOrderController.checkAvailability);
router.get("/:rentalId", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.getRentalById);

router.put("/:rentalId/confirm-delivery", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.confirmDelivery);
router.put("/:rentalId/initiate-return", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.initiateReturn);
router.put("/:rentalId/inspect", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.inspectReturn);
router.put("/:rentalId/complete", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.completeRental);
router.put("/:rentalId/cancel", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.cancelRental);

router.post("/:rentalId/request-extension", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.requestExtension);
router.put("/:rentalId/approve-extension/:requestIndex", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.approveExtension);
router.put("/:rentalId/reject-extension/:requestIndex", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.rejectExtension);

router.post("/:rentalId/message", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), rentalOrderController.sendMessage);

module.exports = router;
