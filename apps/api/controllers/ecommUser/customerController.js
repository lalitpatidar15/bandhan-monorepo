const Enquiry = require("../../models/shared/Enquiry");
const Address = require("../../models/shared/Address");
const CustomerTicket = require("../../models/shared/SupportTicket");

// ---------- Enquiries ----------
exports.createEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      entityType,
      entityId,
      title,
      requiredDate,
      budget,
      guestCount,
      message,
    } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required" });
    const normalizedBudget = budget === "" || budget == null ? undefined : Number(budget);
    const normalizedGuestCount = guestCount === "" || guestCount == null ? undefined : Number(guestCount);
    const normalizedRequiredDate = requiredDate ? new Date(requiredDate) : undefined;
    if (normalizedBudget !== undefined && (!Number.isFinite(normalizedBudget) || normalizedBudget < 0)) {
      return res.status(400).json({ success: false, message: "Budget must be a positive number" });
    }
    if (normalizedGuestCount !== undefined && (!Number.isFinite(normalizedGuestCount) || normalizedGuestCount < 0)) {
      return res.status(400).json({ success: false, message: "Guest count must be a positive number" });
    }
    if (normalizedRequiredDate && !Number.isFinite(normalizedRequiredDate.getTime())) {
      return res.status(400).json({ success: false, message: "Required date is invalid" });
    }
    const enquiry = await Enquiry.create({
      userId: req.user?.id,
      name: name || req.user?.name,
      email: email || req.user?.email,
      phone,
      entityType,
      entityId,
      title,
      requiredDate: normalizedRequiredDate,
      budget: normalizedBudget,
      guestCount: normalizedGuestCount,
      message,
    });
    res.status(201).json({ success: true, enquiry });
  } catch (e) {
    console.error("Error in controllers/ecommUser/customerController.js:", e);

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const list = await Enquiry.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, enquiries: list });
  } catch (e) {
    console.error("Error in controllers/ecommUser/customerController.js:", e);

    res.status(500).json({ success: false, message: e.message });
  }
};

// ---------- Addresses ----------
exports.getAddresses = async (req, res) => {
  try {
    const list = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses: list });
  } catch (e) {
    console.error("Error in controllers/ecommUser/customerController.js:", e);

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const body = { ...req.body, userId: req.user.id };
    if (body.isDefault) {
      await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }
    const addr = await Address.create(body);
    res.status(201).json({ success: true, address: addr });
  } catch (e) {
    console.error("Error in controllers/ecommUser/customerController.js:", e);

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }
    const addr = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!addr) return res.status(404).json({ success: false, message: "Address not found" });
    res.json({ success: true, address: addr });
  } catch (e) {
    console.error("Error in controllers/ecommUser/customerController.js:", e);

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const addr = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!addr) return res.status(404).json({ success: false, message: "Address not found" });
    res.json({ success: true, message: "Address deleted" });
  } catch (e) {
    console.error("Error in controllers/ecommUser/customerController.js:", e);

    res.status(500).json({ success: false, message: e.message });
  }
};

// ---------- Support Tickets ----------
exports.createTicket = async (req, res) => {
  try {
    const { subject, message, orderId } = req.body;
    if (!subject || !message) return res.status(400).json({ success: false, message: "Subject and message are required" });
    const ticket = await CustomerTicket.create({
      userId: req.user.id,
      subject,
      message,
      orderId,
    });
    res.status(201).json({ success: true, ticket });
  } catch (e) {
    console.error("Error in controllers/ecommUser/customerController.js:", e);

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const list = await CustomerTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, tickets: list });
  } catch (e) {
    console.error("Error in controllers/ecommUser/customerController.js:", e);

    res.status(500).json({ success: false, message: e.message });
  }
};
