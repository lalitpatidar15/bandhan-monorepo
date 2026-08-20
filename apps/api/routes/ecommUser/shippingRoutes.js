const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const axios = require("axios");

let shiprocketToken = null;
let tokenExpiry = null;

function sanitizePhone(phoneInput) {
  if (!phoneInput) return "9876543210";
  let digitsOnly = String(phoneInput).replace(/\D/g, "");
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    digitsOnly = digitsOnly.slice(2);
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    digitsOnly = digitsOnly.slice(1);
  }
  return digitsOnly.length === 10 ? digitsOnly : "9876543210";
}

async function getShiprocketToken() {
  if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry) {
    return shiprocketToken;
  }

  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      },
      { timeout: 15000 }
    );

    if (!response.data?.token) {
      throw new Error("Shiprocket did not return a valid token.");
    }

    shiprocketToken = response.data.token;
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    return shiprocketToken;
  } catch (error) {
    console.error("Shiprocket auth failed:", error?.response?.data || error.message);
    throw new Error("Failed to authenticate with Shiprocket");
  }
}

router.post(
  "/create-order",
  auth,
  requireRole("seller", "buyer", "admin", "eventOwner", "learner", "jobSeeker"),
  async (req, res) => {
    try {
      const token = await getShiprocketToken();

      const {
        order_id,
        order_date,
        billing_customer_name,
        billing_last_name,
        billing_address,
        billing_city,
        billing_pincode,
        billing_state,
        billing_country,
        billing_email,
        billing_phone,
        shipping_customer_name,
        shipping_last_name,
        shipping_address,
        shipping_city,
        shipping_pincode,
        shipping_state,
        shipping_country,
        shipping_email,
        shipping_phone,
        order_items,
        payment_method,
        sub_total,
        length,
        breadth,
        height,
        weight,
      } = req.body;

      const rawFullName = String(billing_customer_name || "Customer User").trim();
      const nameParts = rawFullName.split(" ");
      const parsedFirstName = nameParts[0] || "Customer";
      const parsedLastName = billing_last_name || nameParts.slice(1).join(" ") || "User";

      const cleanBillingPhone = sanitizePhone(billing_phone);
      const cleanShippingPhone = sanitizePhone(shipping_phone || billing_phone);

      const shiprocketData = {
        order_id: String(order_id || `ORD-${Date.now()}`),
        order_date: order_date || new Date().toISOString().replace("T", " ").substring(0, 19),
        pickup_location: "Primary",

        billing_customer_name: parsedFirstName,
        billing_last_name: parsedLastName,
        billing_address: billing_address || "Street Address",
        billing_city: billing_city || "City",
        billing_pincode: String(billing_pincode || "110001"),
        billing_state: billing_state || "State",
        billing_country: billing_country || "India",
        billing_email: billing_email || "customer@example.com",
        billing_phone: cleanBillingPhone,

        shipping_is_billing: true,

        shipping_customer_name: shipping_customer_name || parsedFirstName,
        shipping_last_name: shipping_last_name || parsedLastName,
        shipping_address: shipping_address || billing_address || "Street Address",
        shipping_city: shipping_city || billing_city || "City",
        shipping_pincode: String(shipping_pincode || billing_pincode || "110001"),
        shipping_state: shipping_state || billing_state || "State",
        shipping_country: shipping_country || billing_country || "India",
        shipping_email: shipping_email || billing_email || "customer@example.com",
        shipping_phone: cleanShippingPhone,

        order_items: Array.isArray(order_items) && order_items.length > 0
          ? order_items
          : [{ name: "Product", sku: "SKU001", units: 1, selling_price: Number(sub_total || 100) }],
        payment_method: payment_method === "COD" ? "COD" : "Prepaid",
        sub_total: Number(sub_total || 0),
        length: Number(length || 10),
        breadth: Number(breadth || 10),
        height: Number(height || 10),
        weight: Number(weight || 0.5),
      };

      const response = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
        shiprocketData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json({ success: true, data: response.data });
    } catch (error) {
      const responseErrors = error?.response?.data;
      console.error("Shiprocket order creation failed:", responseErrors || error.message);

      return res.status(error?.response?.status || 500).json({
        success: false,
        message: responseErrors?.message || error.message || "Shipping order creation failed",
        errors: responseErrors?.errors || null,
      });
    }
  }
);

router.get(
  "/track/:awb",
  auth,
  requireRole("seller", "buyer", "admin", "eventOwner", "learner", "jobSeeker"),
  async (req, res) => {
    try {
      const token = await getShiprocketToken();
      const response = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(req.params.awb)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return res.json({ success: true, data: response.data });
    } catch (error) {
      console.error("Shiprocket tracking failed:", error?.response?.data || error.message);
      return res.status(error?.response?.status || 500).json({
        success: false,
        message: error?.response?.data?.message || "Tracking failed",
      });
    }
  }
);

module.exports = router;