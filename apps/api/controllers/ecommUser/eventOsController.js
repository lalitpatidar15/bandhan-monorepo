const crypto = require("crypto");
const Event = require("../../models/shared/Event.js");
const EventGuest = require("../../models/shared/EventGuest.js");
const EventTable = require("../../models/shared/EventTable.js");
const EventCollaborator = require("../../models/shared/EventCollaborator.js");
const EventInvitation = require("../../models/shared/EventInvitation.js");
const EventWebsite = require("../../models/shared/EventWebsite.js");
const EventDayIssue = require("../../models/shared/EventDayIssue.js");
const EventMemory = require("../../models/shared/EventMemory.js");
const EscrowMilestone = require("../../models/shared/EscrowMilestone.js");
const EventTemplate = require("../../models/shared/EventTemplate.js");
const ServicePackage = require("../../models/shared/ServicePackage.js");
const Lead = require("../../models/shared/Lead.js");
const User = require("../../models/shared/User.js");

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const err = (res, status, message) => res.status(status).json({ success: false, message });

const tokenHex = () => crypto.randomBytes(16).toString("hex");
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ""));

const assertEventOwner = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, owner: req.user.id });
  if (!event) {
    err(res, 404, "Event not found");
    return null;
  }
  return event;
};

const rsvpUrlBase = () => {
  const base = process.env.NEXT_PUBLIC_CENTRAL_LOGIN_URL || "https://bandhaneventshub.com";
  return String(base).replace(/\/$/, "");
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `event-${Date.now()}`;

const uniqueSlug = async (base, excludeId) => {
  let slug = slugify(base);
  let candidate = slug;
  let i = 1;
  while (await EventWebsite.findOne({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    candidate = `${slug}-${i++}`;
  }
  return candidate;
};

// Guests
exports.getGuests = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const data = await EventGuest.find({ eventId: event._id }).sort({ createdAt: -1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getGuests:", error);
    return err(res, 500, "Failed to fetch guests");
  }
};

exports.createGuest = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const { name, email, phone, plusOne, mealPreference, notes } = req.body || {};
    if (!name || !String(name).trim()) return err(res, 400, "Guest name is required");
    const guest = await EventGuest.create({
      eventId: event._id,
      owner: req.user.id,
      name: String(name).trim(),
      email: String(email || "").trim(),
      phone: String(phone || "").trim(),
      plusOne: Boolean(plusOne),
      mealPreference: String(mealPreference || "").trim(),
      notes: String(notes || "").trim(),
      invitationToken: tokenHex(),
    });
    return ok(res, guest, 201);
  } catch (error) {
    console.error("eventOsController.createGuest:", error);
    return err(res, 500, "Failed to create guest");
  }
};

exports.updateGuest = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const guest = await EventGuest.findOne({ _id: req.params.guestId, eventId: event._id });
    if (!guest) return err(res, 404, "Guest not found");
    const allowed = ["name", "email", "phone", "plusOne", "mealPreference", "rsvpStatus", "tableId", "notes"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) guest[key] = req.body[key];
    }
    await guest.save();
    return ok(res, guest);
  } catch (error) {
    console.error("eventOsController.updateGuest:", error);
    return err(res, 500, "Failed to update guest");
  }
};

exports.deleteGuest = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const guest = await EventGuest.findOneAndDelete({ _id: req.params.guestId, eventId: event._id });
    if (!guest) return err(res, 404, "Guest not found");
    await EventTable.updateMany({ eventId: event._id }, { $pull: { guests: guest._id } });
    await EventInvitation.deleteMany({ guestId: guest._id });
    return res.json({ success: true });
  } catch (error) {
    console.error("eventOsController.deleteGuest:", error);
    return err(res, 500, "Failed to delete guest");
  }
};

exports.checkInGuest = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const guest = await EventGuest.findOne({ _id: req.params.guestId, eventId: event._id });
    if (!guest) return err(res, 404, "Guest not found");
    guest.checkedInAt = guest.checkedInAt ? null : new Date();
    await guest.save();
    return ok(res, guest);
  } catch (error) {
    console.error("eventOsController.checkInGuest:", error);
    return err(res, 500, "Failed to check in guest");
  }
};

exports.getRsvp = async (req, res) => {
  try {
    const guest = await EventGuest.findOne({ invitationToken: req.params.token });
    if (!guest) return err(res, 404, "RSVP not found");
    const event = await Event.findById(guest.eventId).select("title date location");
    if (!event) return err(res, 404, "Event not found");
    return ok(res, {
      eventTitle: event.title,
      date: event.date,
      location: event.location,
      guest: {
        _id: guest._id,
        name: guest.name,
        rsvpStatus: guest.rsvpStatus,
        plusOne: guest.plusOne,
        mealPreference: guest.mealPreference,
      },
    });
  } catch (error) {
    console.error("eventOsController.getRsvp:", error);
    return err(res, 500, "Failed to fetch RSVP");
  }
};

exports.submitRsvp = async (req, res) => {
  try {
    const guest = await EventGuest.findOne({ invitationToken: req.params.token });
    if (!guest) return err(res, 404, "RSVP not found");
    const { status, plusOne, mealPreference } = req.body || {};
    const allowed = ["attending", "declined", "maybe"];
    if (!allowed.includes(status)) return err(res, 400, "Invalid RSVP status");
    guest.rsvpStatus = status;
    if (plusOne !== undefined) guest.plusOne = Boolean(plusOne);
    if (mealPreference !== undefined) guest.mealPreference = String(mealPreference || "").trim();
    await guest.save();
    return ok(res, guest);
  } catch (error) {
    console.error("eventOsController.submitRsvp:", error);
    return err(res, 500, "Failed to submit RSVP");
  }
};

// Tables
exports.getTables = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const data = await EventTable.find({ eventId: event._id }).sort({ createdAt: -1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getTables:", error);
    return err(res, 500, "Failed to fetch tables");
  }
};

exports.createTable = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const { name, capacity, notes } = req.body || {};
    if (!name || !String(name).trim()) return err(res, 400, "Table name is required");
    const table = await EventTable.create({
      eventId: event._id,
      name: String(name).trim(),
      capacity: Number(capacity) > 0 ? Number(capacity) : 8,
      notes: String(notes || "").trim(),
      guests: [],
    });
    return ok(res, table, 201);
  } catch (error) {
    console.error("eventOsController.createTable:", error);
    return err(res, 500, "Failed to create table");
  }
};

exports.updateTable = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const table = await EventTable.findOne({ _id: req.params.tableId, eventId: event._id });
    if (!table) return err(res, 404, "Table not found");
    if (req.body.name !== undefined) table.name = String(req.body.name).trim();
    if (req.body.capacity !== undefined) table.capacity = Number(req.body.capacity) || table.capacity;
    if (req.body.notes !== undefined) table.notes = String(req.body.notes || "").trim();
    await table.save();
    return ok(res, table);
  } catch (error) {
    console.error("eventOsController.updateTable:", error);
    return err(res, 500, "Failed to update table");
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const table = await EventTable.findOneAndDelete({ _id: req.params.tableId, eventId: event._id });
    if (!table) return err(res, 404, "Table not found");
    await EventGuest.updateMany({ eventId: event._id, tableId: String(table._id) }, { $set: { tableId: "" } });
    return res.json({ success: true });
  } catch (error) {
    console.error("eventOsController.deleteTable:", error);
    return err(res, 500, "Failed to delete table");
  }
};

exports.assignTableGuest = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const table = await EventTable.findOne({ _id: req.params.tableId, eventId: event._id });
    if (!table) return err(res, 404, "Table not found");
    const guestId = req.body?.guestId;
    if (!isValidId(guestId)) return err(res, 400, "Valid guestId is required");
    const guest = await EventGuest.findOne({ _id: guestId, eventId: event._id });
    if (!guest) return err(res, 404, "Guest not found");

    await EventTable.updateMany({ eventId: event._id, guests: guest._id }, { $pull: { guests: guest._id } });
    guest.tableId = String(table._id);
    await guest.save();
    const fresh = await EventTable.findById(table._id);
    if (!fresh.guests.some((g) => String(g) === String(guest._id))) fresh.guests.push(guest._id);
    await fresh.save();
    return ok(res, fresh);
  } catch (error) {
    console.error("eventOsController.assignTableGuest:", error);
    return err(res, 500, "Failed to assign guest");
  }
};

exports.removeTableGuest = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const table = await EventTable.findOne({ _id: req.params.tableId, eventId: event._id });
    if (!table) return err(res, 404, "Table not found");
    const guest = await EventGuest.findOne({ _id: req.params.guestId, eventId: event._id });
    if (!guest) return err(res, 404, "Guest not found");
    table.guests = table.guests.filter((g) => String(g) !== String(guest._id));
    await table.save();
    if (String(guest.tableId) === String(table._id)) {
      guest.tableId = "";
      await guest.save();
    }
    return ok(res, table);
  } catch (error) {
    console.error("eventOsController.removeTableGuest:", error);
    return err(res, 500, "Failed to remove guest from table");
  }
};

// Collaborators
exports.getCollaborators = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const data = await EventCollaborator.find({ eventId: event._id }).sort({ createdAt: -1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getCollaborators:", error);
    return err(res, 500, "Failed to fetch collaborators");
  }
};

exports.createCollaborator = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const { email, role, permissions } = req.body || {};
    if (!email || !String(email).trim()) return err(res, 400, "Email is required");
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select("_id");
    const collab = await EventCollaborator.create({
      eventId: event._id,
      userId: existingUser?._id,
      email: normalizedEmail,
      role: ["editor", "viewer", "vendor"].includes(role) ? role : "editor",
      permissions: Array.isArray(permissions) ? permissions.map(String) : [],
      status: "invited",
      token: tokenHex(),
      invitedBy: req.user.id,
    });
    return ok(res, collab, 201);
  } catch (error) {
    console.error("eventOsController.createCollaborator:", error);
    return err(res, 500, "Failed to create collaborator");
  }
};

exports.updateCollaborator = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const collab = await EventCollaborator.findOne({ _id: req.params.collaboratorId, eventId: event._id });
    if (!collab) return err(res, 404, "Collaborator not found");
    if (req.body.role !== undefined && ["editor", "viewer", "vendor"].includes(req.body.role)) collab.role = req.body.role;
    if (req.body.permissions !== undefined && Array.isArray(req.body.permissions)) collab.permissions = req.body.permissions.map(String);
    if (req.body.status !== undefined && ["invited", "accepted", "declined"].includes(req.body.status)) collab.status = req.body.status;
    await collab.save();
    return ok(res, collab);
  } catch (error) {
    console.error("eventOsController.updateCollaborator:", error);
    return err(res, 500, "Failed to update collaborator");
  }
};

exports.deleteCollaborator = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const collab = await EventCollaborator.findOneAndDelete({ _id: req.params.collaboratorId, eventId: event._id });
    if (!collab) return err(res, 404, "Collaborator not found");
    return res.json({ success: true });
  } catch (error) {
    console.error("eventOsController.deleteCollaborator:", error);
    return err(res, 500, "Failed to delete collaborator");
  }
};

exports.acceptCollaborator = async (req, res) => {
  try {
    const collab = await EventCollaborator.findOne({ token: req.params.token });
    if (!collab) return err(res, 404, "Collaborator invitation not found");
    collab.status = "accepted";
    collab.userId = req.user.id;
    await collab.save();
    return ok(res, collab);
  } catch (error) {
    console.error("eventOsController.acceptCollaborator:", error);
    return err(res, 500, "Failed to accept collaborator invitation");
  }
};

// Invitations
exports.getInvitations = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const data = await EventInvitation.find({ eventId: event._id }).sort({ createdAt: -1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getInvitations:", error);
    return err(res, 500, "Failed to fetch invitations");
  }
};

exports.createInvitations = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const guestIds = Array.isArray(req.body?.guestIds) && req.body.guestIds.length ? req.body.guestIds : null;
    const guests = await EventGuest.find(guestIds ? { eventId: event._id, _id: { $in: guestIds } } : { eventId: event._id });
    const created = [];
    for (const guest of guests) {
      let inv = await EventInvitation.findOne({ eventId: event._id, guestId: guest._id });
      if (!inv) {
        inv = await EventInvitation.create({
          eventId: event._id,
          guestId: guest._id,
          channel: "link",
          status: "draft",
          token: guest.invitationToken || tokenHex(),
        });
        if (!guest.invitationToken) {
          guest.invitationToken = inv.token;
          await guest.save();
        }
      }
      created.push(inv);
    }
    return ok(res, created, 201);
  } catch (error) {
    console.error("eventOsController.createInvitations:", error);
    return err(res, 500, "Failed to create invitations");
  }
};

exports.sendInvitations = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const guestIds = Array.isArray(req.body?.guestIds) && req.body.guestIds.length ? req.body.guestIds : null;
    const channel = ["link", "email", "sms"].includes(req.body?.channel) ? req.body.channel : "link";
    const guests = await EventGuest.find(guestIds ? { eventId: event._id, _id: { $in: guestIds } } : { eventId: event._id });
    const links = [];
    for (const guest of guests) {
      if (!guest.invitationToken) {
        guest.invitationToken = tokenHex();
        await guest.save();
      }
      await EventInvitation.findOneAndUpdate(
        { eventId: event._id, guestId: guest._id },
        { $set: { channel, status: "link_ready", token: guest.invitationToken, sentAt: new Date() } },
        { upsert: true, new: true }
      );
      links.push({
        guestId: String(guest._id),
        guestName: guest.name,
        url: `${rsvpUrlBase()}/rsvp/${guest.invitationToken}`,
      });
    }
    return ok(res, { sent: links.length, links });
  } catch (error) {
    console.error("eventOsController.sendInvitations:", error);
    return err(res, 500, "Failed to send invitations");
  }
};

// Website
exports.getWebsite = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const data = await EventWebsite.findOne({ eventId: event._id });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getWebsite:", error);
    return err(res, 500, "Failed to fetch website");
  }
};

exports.createWebsite = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const body = req.body || {};
    const slug = await uniqueSlug(body.slug || body.title || event.title);
    const existing = await EventWebsite.findOne({ eventId: event._id });
    if (existing) return err(res, 409, "Website already exists");
    const site = await EventWebsite.create({
      eventId: event._id,
      slug,
      title: String(body.title || event.title || "").trim(),
      theme: String(body.theme || "classic").trim(),
      coverImage: String(body.coverImage || "").trim(),
      story: String(body.story || "").trim(),
      venueDetails: String(body.venueDetails || "").trim(),
      schedule: Array.isArray(body.schedule) ? body.schedule : [],
      rsvpEnabled: body.rsvpEnabled !== undefined ? Boolean(body.rsvpEnabled) : true,
      published: Boolean(body.published),
    });
    return ok(res, site, 201);
  } catch (error) {
    console.error("eventOsController.createWebsite:", error);
    return err(res, 500, "Failed to create website");
  }
};

exports.updateWebsite = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const site = await EventWebsite.findOne({ eventId: event._id });
    if (!site) return err(res, 404, "Website not found");
    const body = req.body || {};
    if (body.slug !== undefined || body.title !== undefined) {
      site.slug = await uniqueSlug(body.slug || body.title || site.slug, site._id);
    }
    ["title", "theme", "coverImage", "story", "venueDetails"].forEach((k) => {
      if (body[k] !== undefined) site[k] = String(body[k] || "").trim();
    });
    if (body.schedule !== undefined) site.schedule = Array.isArray(body.schedule) ? body.schedule : [];
    if (body.rsvpEnabled !== undefined) site.rsvpEnabled = Boolean(body.rsvpEnabled);
    if (body.published !== undefined) site.published = Boolean(body.published);
    await site.save();
    return ok(res, site);
  } catch (error) {
    console.error("eventOsController.updateWebsite:", error);
    return err(res, 500, "Failed to update website");
  }
};

exports.getPublicWebsite = async (req, res) => {
  try {
    const site = await EventWebsite.findOne({ slug: req.params.slug, published: true });
    if (!site) return err(res, 404, "Website not found");
    return ok(res, site);
  } catch (error) {
    console.error("eventOsController.getPublicWebsite:", error);
    return err(res, 500, "Failed to fetch website");
  }
};

// Event Day
exports.getEventDay = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const [issues, guests] = await Promise.all([
      EventDayIssue.find({ eventId: event._id }).sort({ createdAt: -1 }),
      EventGuest.find({ eventId: event._id }).select("rsvpStatus checkedInAt"),
    ]);
    return ok(res, {
      issues,
      vendors: event.vendors || [],
      venueBookings: event.venues || [],
      guests: {
        invited: guests.length,
        attending: guests.filter((g) => g.rsvpStatus === "attending").length,
        checkedIn: guests.filter((g) => g.checkedInAt).length,
      },
      tasks: event.tasks || [],
    });
  } catch (error) {
    console.error("eventOsController.getEventDay:", error);
    return err(res, 500, "Failed to fetch event day data");
  }
};

exports.createEventDayIssue = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const { type, title, description, assignedTo } = req.body || {};
    if (!title || !String(title).trim()) return err(res, 400, "Title is required");
    const issue = await EventDayIssue.create({
      eventId: event._id,
      type: ["vendor_arrival", "issue", "emergency", "task"].includes(type) ? type : "issue",
      title: String(title).trim(),
      description: String(description || "").trim(),
      assignedTo: String(assignedTo || "").trim(),
      reportedBy: req.user.id,
    });
    return ok(res, issue, 201);
  } catch (error) {
    console.error("eventOsController.createEventDayIssue:", error);
    return err(res, 500, "Failed to create event day issue");
  }
};

exports.updateEventDayIssue = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const issue = await EventDayIssue.findOne({ _id: req.params.issueId, eventId: event._id });
    if (!issue) return err(res, 404, "Issue not found");
    if (req.body.status !== undefined && ["open", "in_progress", "resolved"].includes(req.body.status)) {
      issue.status = req.body.status;
      issue.resolvedAt = req.body.status === "resolved" ? new Date() : null;
    }
    if (req.body.title !== undefined) issue.title = String(req.body.title).trim();
    if (req.body.description !== undefined) issue.description = String(req.body.description || "").trim();
    if (req.body.assignedTo !== undefined) issue.assignedTo = String(req.body.assignedTo || "").trim();
    await issue.save();
    return ok(res, issue);
  } catch (error) {
    console.error("eventOsController.updateEventDayIssue:", error);
    return err(res, 500, "Failed to update event day issue");
  }
};

// Memories
exports.getMemories = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const data = await EventMemory.find({ eventId: event._id }).sort({ createdAt: -1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getMemories:", error);
    return err(res, 500, "Failed to fetch memories");
  }
};

exports.createMemory = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const { title, description, images, memoryDate } = req.body || {};
    if (!title || !String(title).trim()) return err(res, 400, "Title is required");
    const mem = await EventMemory.create({
      eventId: event._id,
      title: String(title).trim(),
      description: String(description || "").trim(),
      images: Array.isArray(images) ? images.map(String) : [],
      createdBy: req.user.id,
      memoryDate: memoryDate ? new Date(memoryDate) : undefined,
    });
    return ok(res, mem, 201);
  } catch (error) {
    console.error("eventOsController.createMemory:", error);
    return err(res, 500, "Failed to create memory");
  }
};

exports.deleteMemory = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const mem = await EventMemory.findOneAndDelete({ _id: req.params.memoryId, eventId: event._id });
    if (!mem) return err(res, 404, "Memory not found");
    return res.json({ success: true });
  } catch (error) {
    console.error("eventOsController.deleteMemory:", error);
    return err(res, 500, "Failed to delete memory");
  }
};

// Milestones
exports.getMilestones = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const data = await EscrowMilestone.find({ eventId: event._id }).sort({ createdAt: -1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getMilestones:", error);
    return err(res, 500, "Failed to fetch milestones");
  }
};

exports.createMilestone = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const { vendorId, vendorName, title, amount, dueDate, proofUrl } = req.body || {};
    if (!title || !String(title).trim()) return err(res, 400, "Title is required");
    const milestone = await EscrowMilestone.create({
      eventId: event._id,
      vendorId: String(vendorId || "").trim(),
      vendorName: String(vendorName || "").trim(),
      title: String(title).trim(),
      amount: Number(amount) || 0,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      proofUrl: String(proofUrl || "").trim(),
      createdBy: req.user.id,
    });
    return ok(res, milestone, 201);
  } catch (error) {
    console.error("eventOsController.createMilestone:", error);
    return err(res, 500, "Failed to create milestone");
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const milestone = await EscrowMilestone.findOne({ _id: req.params.milestoneId, eventId: event._id });
    if (!milestone) return err(res, 404, "Milestone not found");
    if (req.body.status !== undefined && ["pending", "paid", "released", "cancelled"].includes(req.body.status)) {
      milestone.status = req.body.status;
      if (req.body.status === "released") milestone.releasedAt = new Date();
    }
    if (req.body.paymentRef !== undefined) milestone.paymentRef = String(req.body.paymentRef || "").trim();
    if (req.body.proofUrl !== undefined) milestone.proofUrl = String(req.body.proofUrl || "").trim();
    await milestone.save();
    return ok(res, milestone);
  } catch (error) {
    console.error("eventOsController.updateMilestone:", error);
    return err(res, 500, "Failed to update milestone");
  }
};

// Templates apply
exports.applyTemplate = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const template = await EventTemplate.findById(req.params.templateId);
    if (!template) return err(res, 404, "Template not found");

    const phases = Array.isArray(template.phases) ? template.phases.map((p) => ({ name: p.name || "", status: p.status || "Not started", progress: Number(p.progress) || 0 })) : [];
    const tasks = Array.isArray(template.tasks) ? template.tasks.map((t) => ({ title: t.title || "", priority: t.priority || "Medium", status: t.status || "pending", vendor: t.vendor || "", phase: t.phase || "" })) : [];
    event.phases = [...(event.phases || []), ...phases.filter((p) => p.name)];
    event.tasks = [...(event.tasks || []), ...tasks.filter((t) => t.title)];

    const allocated = event.budget?.allocated instanceof Map ? Object.fromEntries(event.budget.allocated) : { ...(event.budget?.allocated || {}) };
    const spentByCategory = event.budget?.spentByCategory instanceof Map ? Object.fromEntries(event.budget.spentByCategory) : { ...(event.budget?.spentByCategory || {}) };
    for (const cat of Array.isArray(template.budgetCategories) ? template.budgetCategories : []) {
      const key = String(cat || "").trim();
      if (!key) continue;
      if (allocated[key] === undefined) allocated[key] = 0;
      if (spentByCategory[key] === undefined) spentByCategory[key] = 0;
    }
    event.budget = {
      ...(event.budget?.toObject ? event.budget.toObject({ flattenMaps: true }) : event.budget || {}),
      allocated,
      spentByCategory,
    };
    await event.save();
    return ok(res, event);
  } catch (error) {
    console.error("eventOsController.applyTemplate:", error);
    return err(res, 500, "Failed to apply template");
  }
};

// Vendor packages
exports.getVendorPackages = async (req, res) => {
  try {
    const data = await ServicePackage.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getVendorPackages:", error);
    return err(res, 500, "Failed to fetch packages");
  }
};

exports.createVendorPackage = async (req, res) => {
  try {
    const { serviceId, name, description, price, billingCycle, inclusions } = req.body || {};
    if (!name || !String(name).trim()) return err(res, 400, "Package name is required");
    const pkg = await ServicePackage.create({
      sellerId: req.user.id,
      serviceId: serviceId || undefined,
      name: String(name).trim(),
      description: String(description || "").trim(),
      price: Number(price) || 0,
      billingCycle: ["one_time", "monthly", "seasonal"].includes(billingCycle) ? billingCycle : "one_time",
      inclusions: Array.isArray(inclusions) ? inclusions.map(String) : [],
      isActive: true,
    });
    return ok(res, pkg, 201);
  } catch (error) {
    console.error("eventOsController.createVendorPackage:", error);
    return err(res, 500, "Failed to create package");
  }
};

exports.updateVendorPackage = async (req, res) => {
  try {
    const pkg = await ServicePackage.findOne({ _id: req.params.id, sellerId: req.user.id });
    if (!pkg) return err(res, 404, "Package not found");
    const body = req.body || {};
    if (body.serviceId !== undefined) pkg.serviceId = body.serviceId || undefined;
    if (body.name !== undefined) pkg.name = String(body.name).trim();
    if (body.description !== undefined) pkg.description = String(body.description || "").trim();
    if (body.price !== undefined) pkg.price = Number(body.price) || 0;
    if (body.billingCycle !== undefined && ["one_time", "monthly", "seasonal"].includes(body.billingCycle)) pkg.billingCycle = body.billingCycle;
    if (body.inclusions !== undefined) pkg.inclusions = Array.isArray(body.inclusions) ? body.inclusions.map(String) : [];
    if (body.isActive !== undefined) pkg.isActive = Boolean(body.isActive);
    await pkg.save();
    return ok(res, pkg);
  } catch (error) {
    console.error("eventOsController.updateVendorPackage:", error);
    return err(res, 500, "Failed to update package");
  }
};

exports.deleteVendorPackage = async (req, res) => {
  try {
    const pkg = await ServicePackage.findOneAndDelete({ _id: req.params.id, sellerId: req.user.id });
    if (!pkg) return err(res, 404, "Package not found");
    return res.json({ success: true });
  } catch (error) {
    console.error("eventOsController.deleteVendorPackage:", error);
    return err(res, 500, "Failed to delete package");
  }
};

exports.getPublicVendorPackages = async (req, res) => {
  try {
    const data = await ServicePackage.find({ sellerId: req.params.sellerId, isActive: true }).sort({ createdAt: -1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getPublicVendorPackages:", error);
    return err(res, 500, "Failed to fetch packages");
  }
};

// Leads
exports.createLead = async (req, res) => {
  try {
    const { sellerId, name, email, phone, eventType, eventDate, budget, source, notes } = req.body || {};
    if (!name || !String(name).trim()) return err(res, 400, "Name is required");
    const lead = await Lead.create({
      sellerId: sellerId || undefined,
      name: String(name).trim(),
      email: String(email || "").trim().toLowerCase(),
      phone: String(phone || "").trim(),
      eventType: String(eventType || "").trim(),
      eventDate: String(eventDate || "").trim(),
      budget: Number(budget) || 0,
      source: String(source || "").trim(),
      notes: String(notes || "").trim(),
      status: "new",
    });
    return ok(res, lead, 201);
  } catch (error) {
    console.error("eventOsController.createLead:", error);
    return err(res, 500, "Failed to create lead");
  }
};

exports.getVendorLeads = async (req, res) => {
  try {
    const data = await Lead.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getVendorLeads:", error);
    return err(res, 500, "Failed to fetch leads");
  }
};

exports.updateVendorLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, sellerId: req.user.id });
    if (!lead) return err(res, 404, "Lead not found");
    if (req.body.status !== undefined && ["new", "contacted", "qualified", "converted", "lost"].includes(req.body.status)) lead.status = req.body.status;
    if (req.body.notes !== undefined) lead.notes = String(req.body.notes || "").trim();
    await lead.save();
    return ok(res, lead);
  } catch (error) {
    console.error("eventOsController.updateVendorLead:", error);
    return err(res, 500, "Failed to update lead");
  }
};

// Vendor replacement
exports.replaceVendor = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const vendorId = String(req.params.vendorId);
    const { name, category, vendorId: newVendorId } = req.body || {};
    if (!name || !String(name).trim()) return err(res, 400, "Replacement vendor name is required");

    let replaced = false;
    event.vendors = (event.vendors || []).map((v) => {
      const idMatch = String(v._id) === vendorId || String(v.vendorId || "") === vendorId;
      if (!idMatch) return v;
      replaced = true;
      return {
        ...(v.toObject ? v.toObject() : v),
        vendorId: String(newVendorId || ""),
        name: String(name).trim(),
        category: String(category || v.category || "").trim(),
        status: "pending",
      };
    });
    if (!replaced) return err(res, 404, "Vendor not found");
    await event.save();
    return ok(res, event);
  } catch (error) {
    console.error("eventOsController.replaceVendor:", error);
    return err(res, 500, "Failed to replace vendor");
  }
};

// Vendor availability
const VendorAvailability = require("../../models/shared/VendorAvailability.js");

exports.getMyAvailability = async (req, res) => {
  try {
    const filter = { sellerId: req.user.id };
    if (req.query.date) filter.date = String(req.query.date);
    const data = await VendorAvailability.find(filter).sort({ date: 1 });
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getMyAvailability:", error);
    return err(res, 500, "Failed to fetch availability");
  }
};

exports.upsertMyAvailability = async (req, res) => {
  try {
    const { date, slots } = req.body || {};
    if (!date || !String(date).trim()) return err(res, 400, "date is required");
    const normalizedSlots = Array.isArray(slots)
      ? slots.map((s) => ({ start: String(s.start || "").trim(), end: String(s.end || "").trim(), isBlocked: Boolean(s.isBlocked) }))
      : [];
    const data = await VendorAvailability.findOneAndUpdate(
      { sellerId: req.user.id, date: String(date).trim() },
      { $set: { sellerId: req.user.id, date: String(date).trim(), slots: normalizedSlots } },
      { new: true, upsert: true, runValidators: true }
    );
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.upsertMyAvailability:", error);
    return err(res, 500, "Failed to update availability");
  }
};

exports.getPublicAvailability = async (req, res) => {
  try {
    const filter = { sellerId: req.params.sellerId };
    if (req.query.date) filter.date = String(req.query.date);
    const rows = await VendorAvailability.find(filter).sort({ date: 1 }).lean();
    const data = rows.map((row) => ({
      ...row,
      slots: (row.slots || []).filter((s) => !s.isBlocked),
    }));
    return ok(res, data);
  } catch (error) {
    console.error("eventOsController.getPublicAvailability:", error);
    return err(res, 500, "Failed to fetch availability");
  }
};

// Event rebooking
exports.rebookEvent = async (req, res) => {
  try {
    const event = await assertEventOwner(req, res);
    if (!event) return;
    const src = event.toObject();
    const newEvent = await Event.create({
      owner: req.user.id,
      title: `${src.title} (rebooked)`,
      description: src.description || "",
      location: src.location || "",
      date: src.date || "",
      guestCount: src.guestCount || 0,
      eventType: src.eventType || "",
      status: "planning",
      phases: Array.isArray(src.phases) ? src.phases.map((p) => ({ name: p.name, status: "Not started", progress: 0 })) : [],
      tasks: Array.isArray(src.tasks) ? src.tasks.map((t) => ({ title: t.title, priority: t.priority || "Medium", status: "pending", vendor: t.vendor || "", phase: t.phase || "" })) : [],
      budget: { total: src.budget?.total || 0, spent: 0, vendorPaid: 0, pending: src.budget?.total || 0, allocated: src.budget?.allocated || {}, spentByCategory: {} },
      guests: { accepted: 0, pending: 0, vip: 0 },
      vendors: [],
      venues: [],
    });
    return ok(res, newEvent);
  } catch (error) {
    console.error("eventOsController.rebookEvent:", error);
    return err(res, 500, "Failed to rebook event");
  }
};
