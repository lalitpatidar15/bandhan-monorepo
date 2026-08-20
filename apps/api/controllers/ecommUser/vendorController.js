const Service = require("../../models/shared/Service.js");

const formatVendor = (service) => ({
  id: service._id,
  _id: service._id,
  name: service.title,
  category: service.category || "service",
  price: String(service.price || 0),
  img: service.image || "",
  rating: service.rating || 0,
  location: service.location || "",
  description: service.description || ""
});

exports.listVendors = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === "true") filter.isFeatured = true;
    if (req.query.q) {
      filter.$or = [
        { title: { $regex: req.query.q, $options: "i" } },
        { description: { $regex: req.query.q, $options: "i" } },
        { location: { $regex: req.query.q, $options: "i" } }
      ];
    }
    const [items, total] = await Promise.all([
      Service.find(filter).sort({ isFeatured: -1, rating: -1 }).skip((page - 1) * limit).limit(limit),
      Service.countDocuments(filter)
    ]);
    res.json({ success: true, vendors: items.map(formatVendor), total, page, limit });
  } catch (error) {
    console.error("Error in controllers/ecommUser/vendorController.js:", error);

    res.status(500).json({ success: false, message: "Failed to fetch vendors" });
  }
};

exports.getVendor = async (req, res) => {
  try {
    const item = await Service.findOne({ _id: req.params.id, isActive: true });
    if (!item) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, vendor: formatVendor(item) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/vendorController.js:", error);

    res.status(500).json({ success: false, message: "Failed to fetch vendors" });
  }
};
