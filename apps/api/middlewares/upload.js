const path = require("path");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");
const { getSetting } = require("../services/configService.js");

class CloudinaryStorage {
  _handleFile(_req, file, callback) {
    const baseName = path
      .parse(file.originalname)
      .name
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);

    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "course-resources",
        resource_type: "auto",
        public_id: `${Date.now()}-${baseName || "upload"}`,
      },
      (error, result) => {
        if (error) return callback(error);

        callback(null, {
          path: result.secure_url,
          url: result.secure_url,
          filename: result.public_id,
          publicId: result.public_id,
          size: result.bytes,
          resourceType: result.resource_type,
        });
      }
    );

    file.stream.pipe(upload);
  }

  _removeFile(_req, _file, callback) {
    callback(null);
  }
}

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const DEFAULT_MAX_SIZE_MB = 500;

async function getMaxUploadBytes() {
  try {
    const mb = await getSetting("maxUploadSize");
    return (mb || DEFAULT_MAX_SIZE_MB) * 1024 * 1024;
  } catch (error) {
    console.error("Error in middlewares/upload.js:", error);

    return DEFAULT_MAX_SIZE_MB * 1024 * 1024;
  }
}

const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || DEFAULT_MAX_SIZE_MB) || DEFAULT_MAX_SIZE_MB;

const upload = multer({
  storage: new CloudinaryStorage(),
  limits: { fileSize: maxUploadSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) return callback(null, true);
    callback(new Error("Only JPG, PNG, PDF, MP4, MOV, AVI, WEBM, DOC and DOCX files are allowed"));
  },
});

upload.getMaxUploadBytes = getMaxUploadBytes;

function normalizeResumeUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url;
}

upload.normalizeResumeUrl = normalizeResumeUrl;

module.exports = upload;
