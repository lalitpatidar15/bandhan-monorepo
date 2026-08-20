const Package = require("../../models/shared/Package.js");
const cloudinary = require("../../config/cloudinary.js");

//  BROWSER PRODUCT PAGE
// ========= create package =========
exports.createPackage = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

   const highlights = req.body.highlights
  ? (req.body.highlights.startsWith("[")
      ? JSON.parse(req.body.highlights)
      : [req.body.highlights])
  : [];

const reviews = req.body.reviews
  ? JSON.parse(req.body.reviews)
  : [];

const vendor = req.body.vendor
  ? JSON.parse(req.body.vendor)
  : {};   const faq = req.body.faq
      ? JSON.parse(req.body.faq)
      : [];

const relatedPackages = req.body.relatedPackages
      ? JSON.parse(req.body.relatedPackages)
      : [];


    const images = req.files ? req.files.map(file => file.path) : [];

    const data = await Package.create({
      title: req.body.title,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      discount: req.body.discount,
      rating: req.body.rating,
      totalReviews: req.body.totalReviews,
      eventType: req.body.eventType,
      serviceTier: req.body.serviceTier,

      description: req.body.description,

      highlights,
      vendor,
      reviews,
       faq,
      relatedPackages,
      images
    });

 res.status(201).json({
      success: true,
      message: "Package created successfully",
      data
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to process package request"
    });
  }
};

// GET ALL PACKAGES
exports.getAllPackages = async (req, res) => {
  try {
    const {
      eventType,
      serviceTier,
      minPrice,
      maxPrice,
      minRating,
      q,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    let filter = {};

    if (eventType) filter.eventType = eventType;
    if (serviceTier) filter.serviceTier = serviceTier;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    let query = Package.find(filter);

    if (sort === "price-low") query = query.sort({ price: 1 });
    else if (sort === "price-high") query = query.sort({ price: -1 });
    else if (sort === "rating") query = query.sort({ rating: -1 });
    else query = query.sort({ createdAt: -1 });

    const total = await Package.countDocuments(filter);
    const packages = await query
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: packages.length,
      total,
      data: packages,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/packageController.js:", err);


    res.status(500).json({
      success: false,
      message: "Failed to process package request"
    });

  }
};

// GET PACKAGE DETAIL
exports.getPackageDetail = async (req, res) => {
  try {

    const data = await Package.findById(req.params.id)
      .populate("relatedPackages");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/packageController.js:", err);


    res.status(500).json({
      success: false,
      message: "Failed to process package request"
    });

  }
};


// UPDATE PACKAGE
exports.updatePackage = async (req, res) => {
  try {

    const packageData = await Package.findById(req.params.id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    const highlights = req.body.highlights
      ? JSON.parse(req.body.highlights)
      : packageData.highlights;

    const reviews = req.body.reviews
      ? JSON.parse(req.body.reviews)
      : packageData.reviews;

    const vendor = req.body.vendor
      ? JSON.parse(req.body.vendor)
      : packageData.vendor;

    const faq = req.body.faq
      ? JSON.parse(req.body.faq)
      : packageData.faq;

    const relatedPackages = req.body.relatedPackages
      ? JSON.parse(req.body.relatedPackages)
      : packageData.relatedPackages;

    let images = packageData.images;

    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title || packageData.title,
        price: req.body.price || packageData.price,
        originalPrice:
          req.body.originalPrice || packageData.originalPrice,
        discount: req.body.discount || packageData.discount,
        rating: req.body.rating || packageData.rating,
        totalReviews:
          req.body.totalReviews || packageData.totalReviews,
        eventType: req.body.eventType || packageData.eventType,
        serviceTier: req.body.serviceTier || packageData.serviceTier,
        description: req.body.description || packageData.description,

        highlights,
        vendor,
        reviews,
        faq,
        relatedPackages,
        images
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updatedPackage
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/packageController.js:", err);


    res.status(500).json({
      success: false,
      message: "Failed to process package request"
    });

  }
};


// DELETE PACKAGE
exports.deletePackage = async (req, res) => {
  try {

    const packageData = await Package.findById(req.params.id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    await Package.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Package deleted successfully"
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/packageController.js:", err);


    res.status(500).json({
      success: false,
      message: "Failed to process package request"
    });

  }
};
