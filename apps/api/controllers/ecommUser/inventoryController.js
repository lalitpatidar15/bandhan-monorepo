const Product = require("../../models/shared/Product.js");
const cloudinary = require("../../config/cloudinary.js");
const { normalizeImages, hasMinimumListingImages, listingMediaError } = require("../../utils/listingMedia.js");

// == SELLER DASHBOARD: ADD PRODUCT ==
exports.addProduct = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    let imageUrls = [];

    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(
        req.file.path,
        { folder: "products" }
      );
      imageUrls.push(uploadedImage.secure_url);
    }

    const submittedImages = Array.isArray(req.body.images)
      ? req.body.images.filter((img) => typeof img === "string" && /^https?:\/\//.test(img))
      : req.body.image ? [req.body.image] : [];

    // FIX: Properly combining uploaded and submitted images
    const combinedImages = imageUrls.length ? imageUrls : submittedImages;
    const images = normalizeImages(combinedImages);

    if (!hasMinimumListingImages(images)) return listingMediaError(res);

    const product = await Product.create({
      sellerId: req.user.id,
      images,
      ...req.body
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Error in addProduct:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to process inventory request"
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search
    } = req.query;

    const query = {
      sellerId: req.user.id
    };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.name = {
        $regex: search,
        $options: "i"
      };
    }

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      products
    });
  } catch (error) {
    console.error("Error in getProducts:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process inventory request"
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        sellerId: req.user.id
      },
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process inventory request"
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({
      _id: req.params.id,
      sellerId: req.user.id
    });

    res.json({
      success: true,
      message: "Product deleted"
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process inventory request"
    });
  }
};

exports.inventoryStats = async (req, res) => {
  try {
    const products = await Product.find({
      sellerId: req.user.id
    });

    const totalValue = products.reduce(
      (sum, item) => sum + (item.price || 0),
      0
    );

    const activeListings = products.filter(
      item => item.status === "active"
    ).length;

    const totalStock = products.reduce(
      (sum, item) => sum + (item.stock || 0),
      0
    );

    res.json({
      success: true,
      totalValue,
      activeListings,
      totalStock
    });
  } catch (error) {
    console.error("Error in inventoryStats:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process inventory request"
    });
  }
};

// ======= ADD PRODUCT MANAGEMENT (MULTIPLE IMAGES) ======
exports.addProductManagement = async (req, res) => {
  try {
    let imageUrls = [];

    // Upload multiple files if available
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(
          file.path,
          { folder: "products" }
        );
        imageUrls.push(result.secure_url);
      }
    }

    const submittedImages = Array.isArray(req.body.images)
      ? req.body.images.filter((image) => typeof image === "string" && /^https?:\/\//.test(image))
      : [];

    // FIX: Declare and normalize images properly
    const combinedImages = imageUrls.length ? imageUrls : submittedImages;
    const images = normalizeImages(combinedImages);

   // Product.create ke andar sellerEmail add karein
const product = await Product.create({
  sellerId: req.user.id,
  sellerEmail: req.user.email, // <--- Add this line
  title: String(req.body.title || req.body.name || "").trim(),
  name: String(req.body.name || req.body.title || "").trim(),
  category: req.body.category,
  subCategory: req.body.subCategory,
  description: req.body.description,
  tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(",")) : [],
  images,
  sku: req.body.sku,
  price: Number(req.body.price || 0),
  stock: Math.max(0, Number(req.body.stock || 0)),
  productType: req.body.productType || req.body.type || "sale",
  type: req.body.type || req.body.productType || "sale",
  stockStatus: Number(req.body.stock || 0) > 0 ? "in_stock" : "out_of_stock",
  status: req.body.status === "draft" ? "draft" : "active",
});

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product
    });

  } catch (error) {
    console.error("Error in addProductManagement:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to process inventory request"
    });
  }
};

exports.saveDraft = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "draft" },
      { new: true }
    );

    res.json({
      success: true,
      message: "Saved as draft",
      data: product
    });

  } catch (err) {
    console.error("Error in saveDraft:", err);

    res.status(500).json({ success: false, message: "Failed to process inventory request" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.json({
      success: true,
      data: product
    });

  } catch (err) {
    console.error("Error in getProduct:", err);

    res.status(500).json({ success: false, message: "Failed to process inventory request" });
  }
};

// ======= INVENTORY MANAGEMENT ======
exports.getInventoryStats = async (req, res) => {
  try {
    const sellerFilter = req.user.role === "admin" ? {} : { sellerId: req.user.id };
    const total = await Product.countDocuments(sellerFilter);

    const inStock = await Product.countDocuments({ ...sellerFilter, stock: { $gt: 10 } });
    const lowStock = await Product.countDocuments({ ...sellerFilter, stock: { $gt: 0, $lte: 10 } });
    const outOfStock = await Product.countDocuments({ ...sellerFilter, stock: 0 });

    const rentalActive = await Product.countDocuments({ ...sellerFilter, type: "rent" });

    res.json({
      total,
      inStock,
      lowStock,
      outOfStock,
      rentalActive
    });

  } catch (err) {
    console.error("Error in getInventoryStats:", err);

    res.status(500).json({ message: "Failed to process inventory request" });
  }
};

exports.getInventoryProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = req.user.role === "admin" ? {} : { sellerId: req.user.id };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, products });

  } catch (err) {
    console.error("Error in getInventoryProducts:", err);

    res.status(500).json({ success: false, message: "Failed to process inventory request" });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    let status = "in_stock";
    if (stock === 0) status = "out_of_stock";
    else if (stock <= 10) status = "low_stock";

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock, stockStatus: status },
      { new: true }
    );

    res.json({ success: true, product });

  } catch (err) {
    console.error("Error in updateStock:", err);

    res.status(500).json({ success: false, message: "Failed to process inventory request" });
  }
};