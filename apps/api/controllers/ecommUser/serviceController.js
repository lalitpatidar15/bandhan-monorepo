const mongoose = require("mongoose");
const Service = require("../../models/shared/Service.js");
const cloudinary = require("../../config/cloudinary.js");
const { getSellerFromReq, isAdmin, buildOwnerScopeFilter } = require("../../utils/ownership.js");
const { normalizeImages, hasMinimumListingImages, listingMediaError } = require("../../utils/listingMedia.js");

const parseImages = (req) => {
  if (req.files && req.files.length > 0) {
    return req.files.map((file) => file.path);
  }
  if (req.body.images) {
    return Array.isArray(req.body.images)
      ? req.body.images.map(String).filter(Boolean)
      : String(req.body.images).split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const parseArrayString = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  return [];
};

const parseNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const parseBoolean = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "1";
};

const escapedPattern = (value) => new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

exports.getServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      q,
      sort,
      eventType,
      budget,
      guests,
      location,
      minRating,
      minPrice,
      maxPrice,
      featured,
    } = req.query;
    const query = { status: "active", isActive: true };
    if (category) query.category = String(category).trim();
    const searchTerm = String(search || q || "").trim();
    if (searchTerm) {
      const pattern = escapedPattern(searchTerm);
      query.$or = [
        { title: pattern },
        { description: pattern },
        { category: pattern },
        { location: pattern },
      ];
    }
    if (location) query.location = escapedPattern(location);
    if (eventType) query.eventType = escapedPattern(eventType);
    if (minRating) query.rating = { $gte: Math.max(0, Number(minRating) || 0) };
    if (featured === "true") query.isFeatured = true;

    const requestedMinPrice = Number(minPrice);
    const requestedMaxPrice = Number(maxPrice || budget);
    if (Number.isFinite(requestedMinPrice) || Number.isFinite(requestedMaxPrice)) {
      query.price = {};
      if (Number.isFinite(requestedMinPrice)) query.price.$gte = requestedMinPrice;
      if (Number.isFinite(requestedMaxPrice)) query.price.$lte = requestedMaxPrice;
    }

    const requestedGuests = Number(guests);
    if (Number.isFinite(requestedGuests) && requestedGuests > 0) {
      query.$and = [
        { $or: [{ minGuests: { $lte: requestedGuests } }, { minGuests: 0 }, { minGuests: { $exists: false } }] },
        { $or: [{ maxGuests: { $gte: requestedGuests } }, { maxGuests: 0 }, { maxGuests: { $exists: false } }] },
      ];
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 20));
    let serviceQuery = Service.find(query).populate("sellerId", "fullName email profilePic role");
    if (sort === "price-low") serviceQuery = serviceQuery.sort({ price: 1 });
    else if (sort === "price-high") serviceQuery = serviceQuery.sort({ price: -1 });
    else if (sort === "rating") serviceQuery = serviceQuery.sort({ rating: -1 });
    else if (sort === "popular") serviceQuery = serviceQuery.sort({ reviewCount: -1, rating: -1 });
    else serviceQuery = serviceQuery.sort({ isFeatured: -1, createdAt: -1 });

    const [services, total] = await Promise.all([
      serviceQuery.skip((pageNumber - 1) * limitNumber).limit(limitNumber),
      Service.countDocuments(query),
    ]);
    res.json({
      success: true,
      data: services,
      services,
      total,
      page: pageNumber,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.max(1, Math.ceil(total / limitNumber)),
      },
    });
  } catch (err) {
    console.error("Error fetching public services:", err);
    res.status(500).json({ success: false, message: "Failed to fetch services" });
  }
};

exports.createService = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const sellerId = String(req.user?.id || req.user?._id || "").trim();
    const sellerEmail = String(req.user?.email || "").trim().toLowerCase();

    if (!sellerId || !sellerEmail) {
      return res.status(400).json({ success: false, message: "Seller identity is required" });
    }

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "services" });
        uploadedImages.push(result.secure_url);
      }
    }

    const images = normalizeImages(uploadedImages.length > 0 ? uploadedImages : parseImages(req));
    if (!hasMinimumListingImages(images)) return listingMediaError(res);

    const newService = await Service.create({
      sellerId,
      sellerEmail,
      title: String(req.body.title || "").trim(),
      category: String(req.body.category || "venue").trim(),
      price: parseNumber(req.body.price, 0),
      eventType: parseArrayString(req.body.eventType),
      location: String(req.body.location || "").trim(),
      description: String(req.body.description || "").trim(),
      minGuests: parseNumber(req.body.minGuests, 0),
      maxGuests: parseNumber(req.body.maxGuests, 0),
      guests: parseNumber(req.body.guests, 0),
      rating: Math.min(5, Math.max(1, parseNumber(req.body.rating, 4.5))),
      image: String(req.body.image || images[0] || "").trim(),
      images,
      status: String(req.body.status || "active").trim().toLowerCase() === "draft" ? "draft" : "active",
      isActive: parseBoolean(req.body.isActive, true),
      isFeatured: parseBoolean(req.body.isFeatured, false),
    });

    res.status(201).json({ success: true, message: "Service created successfully", data: newService });
  } catch (err) {
    console.error("Error in controllers/ecommUser/serviceController.js:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create service" });
  }
};

exports.getSellerServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;
    const isAdminUser = isAdmin(req);
    const query = buildOwnerScopeFilter(req, {});

    if (isAdminUser && req.query.sellerId) {
      query.sellerId = String(req.query.sellerId).trim();
    }
    if (category) {
      query.category = String(category).trim();
    }
    if (status) {
      query.status = String(status).trim();
      if (query.status === "active") {
        query.isActive = true;
      }
    }
    if (search) {
      query.$or = [
        { title: { $regex: String(search), $options: "i" } },
        { description: { $regex: String(search), $options: "i" } },
      ];
    }

    const services = await Service.find(query)
      .populate("sellerId", "fullName email profilePic role")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments(query);

    res.json({ success: true, total, page: Number(page), services });
  } catch (err) {
    console.error("Error in controllers/ecommUser/serviceController.js:", err);
    res.status(500).json({ success: false, message: "Failed to fetch seller services" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Service ID provided" });
    }

    const existingService = await Service.findById(id);
    if (!existingService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const isAdminUser = isAdmin(req);
    if (!isAdminUser && String(existingService.sellerId) !== String(req.user?.id)) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this service" });
    }

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "services" });
        uploadedImages.push(result.secure_url);
      }
    }

    const suppliedImages = uploadedImages.length > 0 ? uploadedImages : parseImages(req);
    const images = suppliedImages.length > 0 ? normalizeImages(suppliedImages) : normalizeImages(existingService.images);
    // On update, allow fewer than the minimum listing images (users may remove images).
    // Require at least one image to remain on the service after edit.
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, message: "At least 1 listing image is required." });
    }
    const updatePayload = {
      ...(req.body.title !== undefined && { title: String(req.body.title).trim() }),
      ...(req.body.category !== undefined && { category: String(req.body.category).trim() }),
      ...(req.body.price !== undefined && { price: parseNumber(req.body.price, existingService.price || 0) }),
      ...(req.body.eventType !== undefined && { eventType: parseArrayString(req.body.eventType) }),
      ...(req.body.location !== undefined && { location: String(req.body.location).trim() }),
      ...(req.body.description !== undefined && { description: String(req.body.description).trim() }),
      ...(req.body.minGuests !== undefined && { minGuests: parseNumber(req.body.minGuests, existingService.minGuests || 0) }),
      ...(req.body.maxGuests !== undefined && { maxGuests: parseNumber(req.body.maxGuests, existingService.maxGuests || 0) }),
      ...(req.body.guests !== undefined && { guests: parseNumber(req.body.guests, existingService.guests || 0) }),
      ...(req.body.rating !== undefined && { rating: Math.min(5, Math.max(1, parseNumber(req.body.rating, existingService.rating || 4.5))) }),
      ...(req.body.status !== undefined && { status: String(req.body.status).trim() === "draft" ? "draft" : "active" }),
      ...(req.body.isActive !== undefined && { isActive: req.body.isActive === "true" || req.body.isActive === true }),
      ...(req.body.isFeatured !== undefined && { isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true }),
      images,
      image: String(images[0] || existingService.image || ""),
    };

    const updatedService = await Service.findByIdAndUpdate(id, { $set: updatePayload }, { new: true, runValidators: true });
    res.json({ success: true, message: "Service updated successfully", data: updatedService });
  } catch (err) {
    console.error("Error in controllers/ecommUser/serviceController.js:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to update service" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const serviceId = String(req.params.id || "").trim();
    if (!serviceId) {
      return res.status(400).json({ success: false, message: "Service id is required" });
    }

    const existingService = await Service.findById(serviceId);
    if (!existingService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const isAdminUser = isAdmin(req);
    if (!isAdminUser && String(existingService.sellerId) !== String(req.user?.id)) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this service" });
    }

    await Service.findOneAndDelete({ _id: serviceId, ...(isAdminUser ? {} : { sellerId: existingService.sellerId }) });
    res.json({ success: true, message: "Service deleted successfully", data: { id: serviceId } });
  } catch (err) {
    console.error("Error in controllers/ecommUser/serviceController.js:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to delete service" });
  }
};

exports.getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.distinct("category", { isActive: true, status: "active" });
    res.json({ success: true, categories });
  } catch (err) {
    console.error("Error in controllers/ecommUser/serviceController.js:", err);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      status: "active",
      isActive: true,
    }).populate("sellerId", "fullName email profilePic role");
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, data: service });
  } catch (err) {
    console.error("Error in controllers/ecommUser/serviceController.js:", err);
    res.status(500).json({ success: false, message: "Failed to fetch service" });
  }
};
