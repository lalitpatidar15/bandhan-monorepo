const Venue = require("../../models/shared/Venue.js");
const { normalizeImages, hasMinimumListingImages, listingMediaError } = require("../../utils/listingMedia.js");

const parseOptionalJson = (value, fallback = []) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); }
  catch { return fallback; }
};

const escapedPattern = (value) => new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

//========== GET VENUE DETAIL ================
exports.getVenueDetail = async (req, res) => {
  try {
    const venue = await Venue.findOne({
      _id: req.params.id,
      status: { $in: ["active", null] },
      isApproved: { $ne: false },
    }).populate("sellerId", "fullName email profilePic role");
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });

    const total = Number(venue.pricePerDay || 0) + Number(venue.serviceFee || 0);
    res.json({ success: true, data: venue, totalPrice: total });
  } catch (error) {
    const status = error?.name === "CastError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? "Invalid venue ID" : "Unable to fetch venue",
    });
  }
};

exports.getSellerVenues = async (req, res) => {
  const data = await Venue.find({ sellerId: req.user.id }).sort({ updatedAt: -1 });
  res.json({ success: true, data });
};

const venueOwnerFilter = (req, id) =>
  req.user?.role === "admin" ? { _id: id } : { _id: id, sellerId: req.user.id };

exports.updateVenue = async (req, res) => {
  try {
    const allowed = ["name", "venueType", "location", "address", "description", "pricePerDay", "pricePerHour", "depositAmount", "serviceFee", "minGuests", "maxGuests", "guests", "facilities", "spaces", "packages", "availability", "status", "isFeatured"];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] === undefined) continue;
      updates[field] = ["facilities", "spaces", "packages", "availability"].includes(field)
        ? parseOptionalJson(req.body[field])
        : req.body[field];
    }
    if (req.files?.length) updates.images = normalizeImages(req.files.map((file) => file.path));
    const venue = await Venue.findOneAndUpdate(venueOwnerFilter(req, req.params.id), updates, { new: true, runValidators: true });
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
    res.json({ success: true, data: venue });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to update venue" });
  }
};

exports.deleteVenue = async (req, res) => {
  const venue = await Venue.findOneAndDelete(venueOwnerFilter(req, req.params.id));
  if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
  res.json({ success: true, message: "Venue deleted" });
};

// serviceLISTING DETAIL PAGE 
// ============ CREATE VENUE =============
exports.createVenue = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

   
    const availability = parseOptionalJson(req.body.availability);

  
    const images = normalizeImages(req.files ? req.files.map(file => file.path) : req.body.images);
    if (!hasMinimumListingImages(images)) return listingMediaError(res);

    const venue = await Venue.create({
      sellerId: req.user?.id,
      sellerEmail: req.user?.email || "",
      name: req.body.name,
      venueType: req.body.venueType,
      location: req.body.location,
      rating: req.body.rating,
      reviews: req.body.reviews,
      guests: req.body.guests,

      description: req.body.description,
      address: req.body.address,
      facilities: parseOptionalJson(req.body.facilities),
      spaces: parseOptionalJson(req.body.spaces),
      packages: parseOptionalJson(req.body.packages),

      pricePerDay: req.body.pricePerDay,
      pricePerHour: req.body.pricePerHour,
      depositAmount: req.body.depositAmount,
      serviceFee: req.body.serviceFee,

      availability,
      images
    });

    res.json({
      success: true,
      data: venue
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to process venue request"
    });
  }
};



// ============== get venue list ==========
exports.getVenueList = async (req, res) => {
  const {
    page = 1,
    limit = 6,
    minPrice,
    maxPrice,
    minRating,
    location,
    guestCount,
    guests,
    budget,
    category,
    featured,
    q,
    sort,
  } = req.query;

  const filter = {
    status: { $in: ["active", null] },
    isApproved: { $ne: false },
  };

  const effectiveMaxPrice = maxPrice || budget;
  if (minPrice || effectiveMaxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (effectiveMaxPrice) filter.pricePerDay.$lte = Number(effectiveMaxPrice);
  }

  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  if (location) {
    filter.location = escapedPattern(location);
  }

  const requestedGuests = Number(guestCount || guests);
  if (Number.isFinite(requestedGuests) && requestedGuests > 0) {
    filter.$and = [
      { $or: [{ minGuests: { $lte: requestedGuests } }, { minGuests: 0 }, { minGuests: { $exists: false } }] },
      {
        $or: [
          { maxGuests: { $gte: requestedGuests } },
          { guests: { $gte: requestedGuests } },
          { maxGuests: 0 },
          { maxGuests: { $exists: false }, guests: { $exists: false } },
        ],
      },
    ];
  }

  if (category) filter.venueType = escapedPattern(category);
  if (featured === "true") filter.isFeatured = true;

  if (q) {
    const pattern = escapedPattern(q);
    filter.$or = [
      { name: pattern },
      { location: pattern },
      { description: pattern },
      { venueType: pattern },
    ];
  }

  let query = Venue.find(filter);

  if (sort === "price-low") query = query.sort({ pricePerDay: 1 });
  else if (sort === "price-high") query = query.sort({ pricePerDay: -1 });
  else if (sort === "rating") query = query.sort({ rating: -1 });
  else if (sort === "popular") query = query.sort({ reviews: -1, rating: -1 });
  else query = query.sort({ isFeatured: -1, createdAt: -1 });

  const total = await Venue.countDocuments(filter);
  const data = await query
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({
    success: true,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};
