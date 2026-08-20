const MIN_LISTING_IMAGES = 4;

function normalizeImages(value) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return [...new Set(source.map((image) => String(image || "").trim()).filter(Boolean))];
}

function hasMinimumListingImages(images) {
  return normalizeImages(images).length >= MIN_LISTING_IMAGES;
}

function listingMediaError(res) {
  return res.status(400).json({
    success: false,
    message: `At least ${MIN_LISTING_IMAGES} listing images are required.`,
  });
}

module.exports = { MIN_LISTING_IMAGES, normalizeImages, hasMinimumListingImages, listingMediaError };
