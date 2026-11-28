const express = require("express");
const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");
const ctrl = require("../../controllers/ecommUser/eventOsController.js");

const router = express.Router();
const ownerAuth = [auth, requireEcommUser];

// Public routes
router.get("/rsvp/:token", ctrl.getRsvp);
router.post("/rsvp/:token", ctrl.submitRsvp);
router.get("/event-site/:slug", ctrl.getPublicWebsite);
router.get("/vendor/packages/:sellerId", ctrl.getPublicVendorPackages);
router.get("/vendor/:sellerId/availability", ctrl.getPublicAvailability);
router.post("/leads", ctrl.createLead);

// Auth-required non-owner-scoped routes
router.post("/collaborators/:token/accept", auth, ctrl.acceptCollaborator);

// Owner-scoped event routes
router.get("/events/:id/guests", ownerAuth, ctrl.getGuests);
router.post("/events/:id/guests", ownerAuth, ctrl.createGuest);
router.put("/events/:id/guests/:guestId", ownerAuth, ctrl.updateGuest);
router.delete("/events/:id/guests/:guestId", ownerAuth, ctrl.deleteGuest);
router.post("/events/:id/guests/:guestId/check-in", ownerAuth, ctrl.checkInGuest);

router.get("/events/:id/tables", ownerAuth, ctrl.getTables);
router.post("/events/:id/tables", ownerAuth, ctrl.createTable);
router.put("/events/:id/tables/:tableId", ownerAuth, ctrl.updateTable);
router.delete("/events/:id/tables/:tableId", ownerAuth, ctrl.deleteTable);
router.post("/events/:id/tables/:tableId/assign", ownerAuth, ctrl.assignTableGuest);
router.delete("/events/:id/tables/:tableId/guests/:guestId", ownerAuth, ctrl.removeTableGuest);

router.get("/events/:id/collaborators", ownerAuth, ctrl.getCollaborators);
router.post("/events/:id/collaborators", ownerAuth, ctrl.createCollaborator);
router.put("/events/:id/collaborators/:collaboratorId", ownerAuth, ctrl.updateCollaborator);
router.delete("/events/:id/collaborators/:collaboratorId", ownerAuth, ctrl.deleteCollaborator);

router.get("/events/:id/invitations", ownerAuth, ctrl.getInvitations);
router.post("/events/:id/invitations", ownerAuth, ctrl.createInvitations);
router.post("/events/:id/invitations/send", ownerAuth, ctrl.sendInvitations);

router.get("/events/:id/website", ownerAuth, ctrl.getWebsite);
router.post("/events/:id/website", ownerAuth, ctrl.createWebsite);
router.put("/events/:id/website", ownerAuth, ctrl.updateWebsite);

router.get("/events/:id/event-day", ownerAuth, ctrl.getEventDay);
router.post("/events/:id/event-day/issues", ownerAuth, ctrl.createEventDayIssue);
router.put("/events/:id/event-day/issues/:issueId", ownerAuth, ctrl.updateEventDayIssue);

router.get("/events/:id/memories", ownerAuth, ctrl.getMemories);
router.post("/events/:id/memories", ownerAuth, ctrl.createMemory);
router.delete("/events/:id/memories/:memoryId", ownerAuth, ctrl.deleteMemory);

router.get("/events/:id/milestones", ownerAuth, ctrl.getMilestones);
router.post("/events/:id/milestones", ownerAuth, ctrl.createMilestone);
router.put("/events/:id/milestones/:milestoneId", ownerAuth, ctrl.updateMilestone);

router.post("/events/:id/apply-template/:templateId", ownerAuth, ctrl.applyTemplate);
router.post("/events/:id/vendors/:vendorId/replace", ownerAuth, ctrl.replaceVendor);
router.post("/events/:id/rebook", ownerAuth, ctrl.rebookEvent);

// Vendor packages & leads (seller-scoped; use auth, requireEcommUser not strictly required but harmless)
router.get("/vendor/packages", auth, ctrl.getVendorPackages);
router.post("/vendor/packages", auth, ctrl.createVendorPackage);
router.put("/vendor/packages/:id", auth, ctrl.updateVendorPackage);
router.delete("/vendor/packages/:id", auth, ctrl.deleteVendorPackage);

router.get("/vendor/availability", auth, ctrl.getMyAvailability);
router.put("/vendor/availability", auth, ctrl.upsertMyAvailability);

router.get("/vendor/leads", auth, ctrl.getVendorLeads);
router.put("/vendor/leads/:id", auth, ctrl.updateVendorLead);

module.exports = router;
