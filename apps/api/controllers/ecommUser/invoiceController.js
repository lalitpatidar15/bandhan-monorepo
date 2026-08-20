const Invoice = require("../../models/shared/Invoice.js");

exports.getInvoiceByOrder = async (req, res) => {
  try {
    const filter = req.user.role === "admin"
      ? { orderId: req.params.orderId }
      : { orderId: req.params.orderId, userId: req.user.id };
    const invoice = await Invoice.findOne(filter);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, invoice });
  } catch (error) {
    console.error("Error in controllers/ecommUser/invoiceController.js:", error);

    res.status(500).json({ success: false, message: "Failed to fetch invoice" });
  }
};

exports.getUserInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) {
    console.error("Error in controllers/ecommUser/invoiceController.js:", error);

    res.status(500).json({ success: false, message: "Failed to fetch invoice" });
  }
};
