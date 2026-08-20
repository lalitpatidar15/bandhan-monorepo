const Booking = require("../../models/shared/Booking.js");
const Venue = require("../../models/shared/Venue.js");
const Service = require("../../models/shared/Service.js");
const { getSetting } = require("../../services/configService.js");

const ownedBooking = (id, userId) => Booking.findOne({ _id: id, userId }).populate("venueId").populate("items.serviceId");
const formatBooking = (booking) => {
  const serviceItem = booking.items?.[0];
  const serviceData = serviceItem?.serviceId;
  const isVenueBooking = Boolean(booking.venueId);

  return {
    id: booking._id,
    _id: booking._id,
    userId: booking.userId,
    bookingType: booking.bookingType || (isVenueBooking ? "venue" : "service"),
    venueId: booking.venueId?._id || booking.venueId || null,
    venueName: booking.venueId?.name || "",
    venueImg: booking.venueId?.images?.[0] || "",
    serviceId: serviceData?._id || serviceItem?.serviceId || null,
    serviceName: serviceData?.title || serviceItem?.title || "",
    serviceImg: serviceData?.image || serviceItem?.image || "",
    eventDate: booking.eventDate,
    guestCount: booking.guestCount || 0,
    eventType: booking.eventType || "",
    startTime: booking.startTime || "",
    endTime: booking.endTime || "",
    packageId: booking.packageId || "",
    requirements: booking.requirements || "",
    contactPerson: booking.contactPerson || "",
    alternateMobile: booking.alternateMobile || "",
    status: booking.status,
    totalPrice: booking.pricing?.total || 0,
    items: booking.items,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
};

exports.createBooking = async (req, res) => {
  try {
    const {
      listingType = "venue",
      listingId,
      eventDate,
      guestCount,
      eventType,
      packageId,
      requirements,
      startTime,
      endTime,
      roomsRequired,
      contactPerson,
      alternateMobile,
      providerId,
    } = req.body;

    if (!listingId || !eventDate) {
      return res.status(400).json({ success: false, message: "Listing and event date are required" });
    }

    const serviceFee = Number(await getSetting("serviceFee") || 0);
    const taxRate = Number(await getSetting("taxRate") || 0);

    let bookingData = {
      userId: req.user.id,
      bookingType: listingType === "service" ? "service" : "venue",
      eventDate,
      guestCount: Number(guestCount || 0),
      eventType: eventType || "",
      startTime: startTime || "",
      endTime: endTime || "",
      packageId: packageId || "",
      requirements: requirements || "",
      contactPerson: contactPerson || "",
      alternateMobile: alternateMobile || "",
      status: "pending",
    };

    if (listingType === "service") {
      const service = await Service.findById(listingId);
      if (!service) return res.status(404).json({ success: false, message: "Service not found" });

      if (startTime) {
        const slotConflict = await Booking.exists({
          bookingType: "service",
          eventDate: new Date(eventDate),
          startTime,
          status: { $in: ["pending", "confirmed", "in_progress"] },
          "items.serviceId": service._id,
          ...(providerId ? { "items.providerId": String(providerId) } : {}),
        });
        if (slotConflict) return res.status(409).json({ success: false, message: "This service time slot is no longer available" });
      }

      const subtotal = Number(service.price || 0);
      const tax = Math.round(subtotal * taxRate);
      const total = subtotal + serviceFee + tax;

      bookingData = {
        ...bookingData,
        items: [
          {
            serviceId: service._id,
            providerId: providerId ? String(providerId) : "",
            title: service.title,
            image: service.image || "",
            priceAtTime: service.price,
            quantity: 1,
          },
        ],
        pricing: {
          subtotal,
          serviceFee,
          tax,
          total,
        },
      };
    } else {
      const venue = await Venue.findById(listingId);
      if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });

      const conflict = await Booking.exists({ venueId: listingId, eventDate: new Date(eventDate), status: { $ne: "cancelled" } });
      if (conflict) return res.status(409).json({ success: false, message: "Venue is not available on this date" });

      const subtotal = Number(venue.pricePerDay || 0);
      const tax = Math.round(subtotal * taxRate);
      const total = subtotal + Number(venue.serviceFee || 0) + tax;

      bookingData = {
        ...bookingData,
        venueId: listingId,
        guestCount: Number(guestCount || 0),
        eventType: eventType || "",
        pricing: {
          subtotal,
          serviceFee: Number(venue.serviceFee || 0),
          tax,
          total,
        },
        roomsRequired: roomsRequired || "",
      };
    }

    let booking = await Booking.create(bookingData);
    booking = await ownedBooking(booking._id, req.user.id);

    res.status(201).json({ success: true, message: "Booking created", booking: formatBooking(booking) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/bookingController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process booking request" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("venueId")
      .populate("items.serviceId")
      .sort({ createdAt: -1 });
    res.json({ success: true, total: bookings.length, bookings: bookings.map(formatBooking) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/bookingController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process booking request" });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await ownedBooking(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking: formatBooking(booking) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/bookingController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process booking request" });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const allowed = ["eventDate", "guestCount", "eventType"];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, status: { $in: ["pending", "confirmed"] } },
      updates,
      { new: true, runValidators: true }
    ).populate("venueId");
    if (!booking) return res.status(404).json({ success: false, message: "Editable booking not found" });
    res.json({ success: true, message: "Booking updated", booking: formatBooking(booking) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/bookingController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process booking request" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, status: { $in: ["pending", "confirmed"] } },
      { status: "cancelled" },
      { new: true }
    ).populate("venueId");
    if (!booking) return res.status(404).json({ success: false, message: "Cancellable booking not found" });
    res.json({ success: true, message: "Booking cancelled", booking: formatBooking(booking) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/bookingController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process booking request" });
  }
};

exports.getAvailableDates = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId).select("availability");
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
    const booked = await Booking.find({ venueId: venue._id, status: { $ne: "cancelled" } }).distinct("eventDate");
    const bookedSet = new Set(booked.map((date) => new Date(date).toISOString().slice(0, 10)));
    const dates = (venue.availability || [])
      .filter((entry) => entry.status === "available")
      .map((entry) => new Date(entry.date).toISOString().slice(0, 10))
      .filter((date) => !bookedSet.has(date));
    res.json({ success: true, dates });
  } catch (error) {
    console.error("Error in controllers/ecommUser/bookingController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process booking request" });
  }
};
