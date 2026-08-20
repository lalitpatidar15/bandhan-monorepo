const axios = require("axios");

const API_URL = "https://apiv2.shiprocket.in/v1/external";
let accessToken = null;
let expiresAt = 0;

function configured() {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

async function getToken() {
  if (!configured()) {
    const error = new Error("Shiprocket is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.");
    error.statusCode = 503;
    throw error;
  }
  if (accessToken && Date.now() < expiresAt) return accessToken;

  try {
    const { data } = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      },
      { timeout: 15000 }
    );

    if (!data?.token) throw new Error("Shiprocket did not return an access token");
    
    accessToken = data.token;
    expiresAt = Date.now() + (23 * 60 * 60 * 1000) + (55 * 60 * 1000);
    return accessToken;
  } catch (cause) {
    const error = new Error("Unable to authenticate with Shiprocket");
    error.statusCode = 502;
    error.cause = cause;
    throw error;
  }
}

async function request(method, path, body) {
  const token = await getToken();
  try {
    const { data } = await axios({
      method,
      url: `${API_URL}${path}`,
      data: body,
      timeout: 20000,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (cause) {
    const responseData = cause?.response?.data;
    const message = responseData?.message || (typeof responseData?.errors === 'string' ? responseData.errors : null) || cause?.message || "Shiprocket request failed";

    const error = new Error(message);
    error.statusCode = cause?.response?.status >= 400 && cause?.response?.status < 500 ? 422 : 502;
    error.cause = cause;
    throw error;
  }
}

exports.isConfigured = configured;
exports.createOrder = (payload) => request("post", "/orders/create/adhoc", payload);
exports.assignAwb = (shipmentId, courierId) =>
  request("post", "/courier/assign/awb", {
    shipment_id: shipmentId,
    ...(courierId ? { courier_id: courierId } : {}),
  });
exports.generateLabel = (shipmentId) =>
  request("post", "/courier/generate/label", { shipment_id: [shipmentId] });
exports.trackAwb = (awb) => request("get", `/courier/track/awb/${encodeURIComponent(awb)}`);