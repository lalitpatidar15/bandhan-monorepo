// Shared shipping normalisation for every product writer (seller inventory,
// public product API, admin catalogue) and for the Shiprocket payload builder.
// Keeping one normaliser avoids the seller form and the courier payload from
// disagreeing about what "weight" or "dimensions" mean.

const PINCODE_RE = /^\d{6}$/;

function has(body, key) {
  return Object.prototype.hasOwnProperty.call(body || {}, key);
}

function toBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalised = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalised)) return true;
  if (["false", "0", "no", "off"].includes(normalised)) return false;
  return fallback;
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function toText(value, maxLength = 160) {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text ? text.slice(0, maxLength) : undefined;
}

function toPincode(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const digits = String(value).replace(/\D/g, "");
  return PINCODE_RE.test(digits) ? digits : undefined;
}

function readObject(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function readDimensions(body) {
  const dimensions = readObject(body?.dimensions)
    || readObject(body?.shippingDimensions);
  const source = dimensions || body || {};

  const length = toNumber(source.length ?? dimensions?.length);
  const width = toNumber(source.width ?? source.breadth ?? dimensions?.width ?? dimensions?.breadth);
  const height = toNumber(source.height ?? dimensions?.height);

  if (length === undefined && width === undefined && height === undefined) return undefined;
  return {
    length: length ?? 0,
    width: width ?? 0,
    height: height ?? 0,
  };
}

// Returns only the shipping keys actually supplied, so partial updates do not
// erase values that were saved earlier.
function normalizeShippingFields(body = {}) {
  const fields = {};

  if (has(body, "shippingRequired") || has(body, "requiresShipping")) {
    fields.shippingRequired = toBoolean(body.shippingRequired ?? body.requiresShipping, true);
  }
  if (has(body, "freeShipping")) {
    fields.freeShipping = toBoolean(body.freeShipping, false);
  }

  const weight = toNumber(body.weight ?? body.shippingWeight);
  if (has(body, "weight") || has(body, "shippingWeight")) {
    if (weight !== undefined) {
      fields.weight = weight;
      fields.shippingWeight = weight;
    }
  }

  const dimensions = readDimensions(body);
  if (dimensions) fields.dimensions = dimensions;

  const shippingCost = toNumber(body.shippingCost ?? body.shippingCharge);
  if (has(body, "shippingCost") || has(body, "shippingCharge")) {
    fields.shippingCost = shippingCost ?? 0;
  }

  if (has(body, "originPincode") || has(body, "dispatchPincode")) {
    fields.originPincode = toPincode(body.originPincode ?? body.dispatchPincode) ?? null;
  }
  if (has(body, "pickupLocation")) {
    fields.pickupLocation = toText(body.pickupLocation, 80) || "Primary";
  }
  if (has(body, "dispatchAddress")) {
    fields.dispatchAddress = toText(body.dispatchAddress, 240);
  }
  if (has(body, "courierPreference")) {
    fields.courierPreference = toText(body.courierPreference, 80);
  }
  if (has(body, "hsnCode")) {
    fields.hsnCode = toText(body.hsnCode, 20);
  }

  return fields;
}

// A product that needs courier shipping cannot be published without the data
// Shiprocket uses to create an order. Drafts may be incomplete.
function validateShippingForActive(product = {}) {
  if (product.shippingRequired === false) return null;

  const weight = Number(product.weight ?? product.shippingWeight);
  if (!(weight > 0)) {
    return "Add a package weight (kg) in the Shipping step before publishing.";
  }

  const dimensions = readObject(product.dimensions) || {};
  const missing = ["length", "width", "height"].filter(
    (key) => !(Number(dimensions[key]) > 0)
  );
  if (missing.length > 0) {
    return `Add package ${missing.join(", ")} (cm) in the Shipping step before publishing.`;
  }

  if (!PINCODE_RE.test(String(product.originPincode || "").replace(/\D/g, ""))) {
    return "Add a valid 6-digit dispatch pincode in the Shipping step before publishing.";
  }

  return null;
}

module.exports = {
  normalizeShippingFields,
  validateShippingForActive,
  toBoolean,
  toNumber,
  toPincode,
  readDimensions,
};
