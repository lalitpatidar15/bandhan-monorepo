const Event = require("../../models/shared/Event.js");

const SIMPLE_UPDATE_FIELDS = [
  "title",
  "description",
  "date",
  "location",
  "guestCount",
  "eventType",
  "status",
  "phases",
  "tasks",
  "vendors",
  "venues",
  "guests",
];

const numberOr = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const mapToObject = (value) => {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value && typeof value === "object") return { ...value };
  return {};
};

const normalizeBudget = (value, existing = {}) => {
  const previous = existing?.toObject
    ? existing.toObject({ flattenMaps: true })
    : existing || {};
  const input = typeof value === "number" ? { total: value } : value || {};
  const total = numberOr(input.total, numberOr(previous.total));
  const spent = numberOr(input.spent, numberOr(previous.spent));

  return {
    total,
    spent,
    vendorPaid: numberOr(input.vendorPaid, numberOr(previous.vendorPaid)),
    pending: Math.max(0, total - spent),
    allocated: {
      ...mapToObject(previous.allocated),
      ...mapToObject(input.allocated),
    },
    spentByCategory: {
      ...mapToObject(previous.spentByCategory),
      ...mapToObject(input.spentByCategory),
    },
  };
};

const serializeEvent = (event) => {
  const output = event.toObject({ virtuals: true, flattenMaps: true });
  const eventDate = new Date(`${output.date}T00:00:00`);
  const daysToGo = Number.isNaN(eventDate.getTime())
    ? output.daysToGo
    : Math.max(0, Math.ceil((eventDate.getTime() - Date.now()) / 86400000));

  return {
    ...output,
    id: String(output._id),
    userId: String(output.owner),
    daysToGo,
  };
};

const respondWithError = (res, error) => {
  console.error("Error in controllers/ecommUser/eventController.js:", error);
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid event data" });
  }
  return res.status(500).json({ success: false, message: "Failed to process event request" });
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...Object.fromEntries(
        SIMPLE_UPDATE_FIELDS.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]])
      ),
      owner: req.user.id,
      budget: normalizeBudget(req.body.budget),
    });

    res.status(201).json({
      event: serializeEvent(event),
      message: "Event created successfully",
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ events: events.map(serializeEvent), total: events.length });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, owner: req.user.id });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ event: serializeEvent(event) });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, owner: req.user.id });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    for (const field of SIMPLE_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    }
    if (req.body.budget !== undefined) {
      event.budget = normalizeBudget(req.body.budget, event.budget);
    }
    await event.save();

    res.json({ event: serializeEvent(event), message: "Event updated successfully" });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (error) {
    respondWithError(res, error);
  }
};

const appendEntry = (field) => async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, owner: req.user.id });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    event[field].push(req.body);
    await event.save();
    res.status(201).json({
      event: serializeEvent(event),
      message: `${field === "vendors" ? "Vendor" : "Venue"} added`,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

const removeEntry = (field, paramName, externalIdField) => async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, owner: req.user.id });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const entryId = String(req.params[paramName]);
    event[field] = event[field].filter(
      (entry) => String(entry._id) !== entryId && String(entry[externalIdField] || "") !== entryId
    );
    await event.save();
    res.json({
      event: serializeEvent(event),
      message: `${field === "vendors" ? "Vendor" : "Venue"} removed`,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.addVendor = appendEntry("vendors");
exports.removeVendor = removeEntry("vendors", "vendorId", "vendorId");
exports.addVenue = appendEntry("venues");
exports.removeVenue = removeEntry("venues", "venueId", "venueId");
