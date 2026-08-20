const Product = require("../../models/shared/Product.js");
const Order = require("../../models/shared/Order.js");
const mongoose = require("mongoose");
const { safeDeleteProduct } = require("../../services/productService.js");
const { getSellerFromReq, isAdmin } = require("../../utils/ownership.js");
const { normalizeImages, hasMinimumListingImages, listingMediaError } = require("../../utils/listingMedia.js");

const PRODUCT_AVAILABILITY = new Set(["sale", "rent", "both"]);
const ALLOWED_PRODUCT_FIELDS = new Set([
  "title", "category", "subCategory", "brand", "description", "tags",
  "video", "sku", "price", "mrp", "discount", "discountType",
  "priceUnit", "rentalPrice", "rentalDuration", "securityDeposit",
  "lateReturnFee", "stock", "rentalStock", "stockStatus",
  "specifications", "weight", "shippingRequired", "shippingCost",
  "freeShipping", "location", "returnPolicy", "warranty", "status"
]);

function normalizeAvailability(value) {
  if (typeof value !== "string") return "sale";
  const normalized = value.trim().toLowerCase();
  if (normalized === "rental") return "rent";
  return PRODUCT_AVAILABILITY.has(normalized) ? normalized : "sale";
}

function availabilityFilter(value) {
  const availability = normalizeAvailability(value);
  if (availability === "rent") return ["rent", "rental", "both"];
  if (availability === "sale") return ["sale", "both"];
  return ["both"];
}

function applyAvailabilityFilter(filter, value) {
  filter.$expr = {
    $in: [
      { $toLower: { $ifNull: ["$productType", ""] } },
      availabilityFilter(value),
    ],
  };
}

// ======== GET PRODUCTS ============
exports.getProducts = async (req, res) => {
  try {
    const {
      category, subCategory, brand, minPrice, maxPrice, minRating,
      location, stockStatus, sort, featured, productType, type,
      q, sellerId, page = 1, limit = 12,
    } = req.query;

    const { sellerId: authSellerId } = getSellerFromReq(req);

    let filter = { status: "active" };

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (sellerId) {
      // only admin or the same seller may filter by sellerId
      if (!isAdmin(req) && String(authSellerId) !== String(sellerId)) {
        return res.status(403).json({ success: false, message: "Forbidden: cannot filter by sellerId" });
      }
      filter.sellerId = sellerId;
    }

    if (productType || type) {
      applyAvailabilityFilter(filter, productType || type);
    }

    if (featured === "true") filter.isFeatured = true;
    if (stockStatus) filter.stockStatus = stockStatus;

    if (minPrice && maxPrice) {
      filter.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice) {
      filter.price = { $gte: Number(minPrice) };
    } else if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (location) filter.location = { $regex: location, $options: "i" };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { subCategory: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    let query = Product.find(filter);

    if (sort === "low" || sort === "price-low") query = query.sort({ price: 1 });
    else if (sort === "high" || sort === "price-high") query = query.sort({ price: -1 });
    else if (sort === "rating") query = query.sort({ rating: -1 });
    else if (sort === "newest") query = query.sort({ createdAt: -1 });
    else if (sort === "popularity") query = query.sort({ orders: -1 });
    else query = query.sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);
    const data = await query
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const enrichedData = await Promise.all(data.map(async (product) => {
      if (!product.sellerId) return product.toObject();
      const sellerProfile = await require("../../models/shared/User.js").findById(product.sellerId).select("name fullName nameEn email").lean();
      return {
        ...product.toObject(),
        sellerName: product.sellerName || sellerProfile?.fullName || sellerProfile?.name || sellerProfile?.nameEn || "Verified Seller",
        sellerEmail: product.sellerEmail || sellerProfile?.email || "",
      };
    }));

    res.json({
      success: true,
      data: enrichedData,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Error in controllers/ecommUser/productController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// ======== GET PRODUCT BY ID ============
exports.getPublicProducts = async (req, res) => {
  try {
    const {
      category, subCategory, brand, minPrice, maxPrice, minRating,
      location, stockStatus, sort, featured, productType, type,
      q, exclude, page = 1, limit = 12,
    } = req.query;

    let filter = { status: "active", isPublished: true, isApproved: true };

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (productType || type) applyAvailabilityFilter(filter, productType || type);
    if (featured === "true") filter.isFeatured = true;
    if (stockStatus) filter.stockStatus = stockStatus;
    if (minPrice && maxPrice) filter.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    else if (minPrice) filter.price = { $gte: Number(minPrice) };
    else if (maxPrice) filter.price = { $lte: Number(maxPrice) };
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (exclude) {
      if (!mongoose.Types.ObjectId.isValid(exclude)) {
        return res.status(400).json({ success: false, message: "Invalid excluded product ID" });
      }
      filter._id = { $ne: exclude };
    }
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { subCategory: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    let query = Product.find(filter);
    if (sort === "low" || sort === "price-low") query = query.sort({ price: 1 });
    else if (sort === "high" || sort === "price-high") query = query.sort({ price: -1 });
    else if (sort === "rating") query = query.sort({ rating: -1 });
    else if (sort === "newest") query = query.sort({ createdAt: -1 });
    else if (sort === "popularity") query = query.sort({ orders: -1 });
    else query = query.sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);
    const data = await query
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const enrichedData = await Promise.all(data.map(async (product) => {
      if (!product.sellerId) return product.toObject();
      const sellerProfile = await require("../../models/shared/User.js").findById(product.sellerId).select("name fullName nameEn email").lean();
      return {
        ...product.toObject(),
        sellerName: product.sellerName || sellerProfile?.fullName || sellerProfile?.name || sellerProfile?.nameEn || "Verified Seller",
        sellerEmail: product.sellerEmail || sellerProfile?.email || "",
      };
    }));

    res.json({
      success: true,
      data: enrichedData,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Error in controllers/ecommUser/productController.js (getPublicProducts):", err);
    res.status(500).json({ success: false, message: "Failed to fetch public products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const product = await Product.findOne({
      _id: id,
      status: "active",
      isPublished: true,
      isApproved: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let sellerProfile = null;
    if (product.sellerId) {
      sellerProfile = await require("../../models/shared/User.js").findById(product.sellerId).select("name fullName nameEn email").lean();
    }

    const sellerName = product.sellerName || sellerProfile?.fullName || sellerProfile?.name || sellerProfile?.nameEn || "Verified Seller";
    const sellerEmail = product.sellerEmail || sellerProfile?.email || "";

    await Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    res.json({ success: true, data: { ...product.toObject(), sellerName, sellerEmail } });
  } catch (err) {
    console.error("Error in controllers/ecommUser/productController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

// ======== CREATE PRODUCT ============
exports.createProduct = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((f) => images.push(f.path));
    } else if (req.file) {
      images.push(req.file.path);
    }

    const sellerId = String(req.user.id).trim();
    const sellerEmail = String(req.user.email || "").trim().toLowerCase();

    const availability = normalizeAvailability(req.body.productType || req.body.type);

    const normalizedImages = normalizeImages(images.length ? images : req.body.images);
    if (!hasMinimumListingImages(normalizedImages)) return listingMediaError(res);
    const product = await Product.create({
      sellerId,
      sellerEmail,
      title: req.body.title,
      category: req.body.category,
      subCategory: req.body.subCategory,
      brand: req.body.brand,
      description: req.body.description,
      tags: req.body.tags ? (typeof req.body.tags === "string" ? req.body.tags.split(",").map(t => t.trim()) : req.body.tags) : [],
      images: normalizedImages,
      video: req.body.video,
      sku: req.body.sku,
      price: Number(req.body.price),
      mrp: req.body.mrp ? Number(req.body.mrp) : undefined,
      discount: req.body.discount ? Number(req.body.discount) : 0,
      discountType: req.body.discountType || "percentage",
      productType: availability,
      type: availability,
      priceUnit: req.body.priceUnit || "fixed",
      rentalPrice: req.body.rentalPrice ? Number(req.body.rentalPrice) : undefined,
      rentalDuration: req.body.rentalDuration || "day",
      securityDeposit: req.body.securityDeposit ? Number(req.body.securityDeposit) : 0,
      lateReturnFee: req.body.lateReturnFee ? Number(req.body.lateReturnFee) : 0,
      stock: req.body.stock ? Number(req.body.stock) : 0,
      rentalStock: req.body.rentalStock ? Number(req.body.rentalStock) : 0,
      stockStatus: req.body.stockStatus || "in_stock",
      specifications: req.body.specifications ? (typeof req.body.specifications === "string" ? JSON.parse(req.body.specifications) : req.body.specifications) : [],
      weight: req.body.weight ? Number(req.body.weight) : undefined,
      shippingRequired: req.body.shippingRequired !== "false",
      shippingCost: req.body.shippingCost ? Number(req.body.shippingCost) : 0,
      freeShipping: req.body.freeShipping === "true",
      location: req.body.location,
      sellerName: req.body.sellerName,
      isFeatured: false,
      returnPolicy: req.body.returnPolicy || "7-day return policy",
      warranty: req.body.warranty,
      status: req.body.status || "draft",
    });

    res.status(201).json({ success: true, data: product, message: "Product created" });
  } catch (err) {
    console.error("Error in controllers/ecommUser/productController.js:", err);

    res.status(500).json({ success: false, message: "Failed to create product" });
  }
};

// ======== UPDATE PRODUCT ============
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Allow admin to update any product; seller can only update own
    const isAdmin = String(req.user?.role || "").toLowerCase() === "admin";
    if (!req.user || (!isAdmin && product.sellerId.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const allowedUpdates = {};
    for (const key of Object.keys(req.body)) {
      if (ALLOWED_PRODUCT_FIELDS.has(key)) {
        allowedUpdates[key] = req.body[key];
      }
    }

    if (req.files && req.files.length > 0) {
      allowedUpdates.images = req.files.map(f => f.path);
    }
    const nextImages = normalizeImages(allowedUpdates.images || product.images);
    if (!hasMinimumListingImages(nextImages)) return listingMediaError(res);
    allowedUpdates.images = nextImages;

    if (allowedUpdates.tags && typeof allowedUpdates.tags === "string") {
      allowedUpdates.tags = allowedUpdates.tags.split(",").map(t => t.trim());
    }
    if (allowedUpdates.specifications && typeof allowedUpdates.specifications === "string") {
      allowedUpdates.specifications = JSON.parse(allowedUpdates.specifications);
    }

    if (allowedUpdates.productType || allowedUpdates.type) {
      const availability = normalizeAvailability(allowedUpdates.productType || allowedUpdates.type);
      allowedUpdates.productType = availability;
      allowedUpdates.type = availability;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });

    res.json({ success: true, data: updated, message: "Product updated" });
  } catch (err) {
    console.error("Error in controllers/ecommUser/productController.js:", err);

    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

// ======== DELETE PRODUCT (Safe) ============
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Allow admin to delete any product; seller can only delete own
    const isAdmin = String(req.user?.role || "").toLowerCase() === "admin";
    if (!req.user || (!isAdmin && product.sellerId.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Use safe delete: if product has been ordered, soft-delete instead of hard delete
    const result = await safeDeleteProduct(req.params.id, req.user.id);

    if (result.action === "hard-deleted") {
      return res.json({ success: true, message: "Product permanently deleted" });
    }

    if (result.action === "soft-deleted") {
      return res.json({
        success: true,
        message: "Product has existing orders. It has been deactivated and hidden from the marketplace. Historical order data is preserved."
      });
    }

    return res.status(400).json({ success: false, message: "Unable to delete product" });
  } catch (err) {
    console.error("Error in controllers/ecommUser/productController.js:", err);

    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

// ======== GET SELLER PRODUCTS (authenticated seller) ============
exports.getSellerProducts = async (req, res) => {
  try {
    const sellerId = String(req.user?.id || "").trim();
    const isAdmin = String(req.user?.role || "").toLowerCase() === "admin";

    // Admin can see all products, seller sees only own
    const filter = isAdmin ? {} : { sellerId };

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error("Error in controllers/ecommUser/productController.js (getProducts):", err);
    res.status(500).json({ success: false, message: "Failed to fetch seller products" });
  }
};

// ======== GET CATEGORIES ============
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { status: "active" });
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("Error in controllers/ecommUser/productController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// ======== GET BRANDS ============
exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand", { status: "active", brand: { $exists: true, $ne: "" } });
    res.json({ success: true, data: brands });
  } catch (err) {
    console.error("Error in controllers/ecommUser/productController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch brands" });
  }
};
