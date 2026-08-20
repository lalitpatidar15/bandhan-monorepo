const fs = require("fs");
const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");

const requiredServiceAccountKeys = [
  "type",
  "project_id",
  "private_key",
  "client_email",
];

const sanitizeServiceAccountString = (rawValue) => {
  if (!rawValue || typeof rawValue !== "string") {
    return rawValue;
  }

  let text = rawValue.trim();
  const firstChar = text[0];
  const lastChar = text[text.length - 1];

  if ((firstChar === "'" && lastChar === "'") || (firstChar === '"' && lastChar === '"')) {
    text = text.slice(1, -1);
  }

  return text.replace(/\r?\n/g, "\\n");
};

const parseServiceAccountJson = (rawValue) => {
  const normalized = sanitizeServiceAccountString(rawValue);
  if (!normalized) {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch (error) {
    console.error(
      "Invalid Firebase service account configuration: FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. " +
        "Please store it as a valid JSON string in the environment."
    );
    return null;
  }
};

const validateServiceAccount = (account) => {
  if (!account || typeof account !== "object") {
    return false;
  }

  return requiredServiceAccountKeys.every(
    (key) => typeof account[key] === "string" && account[key].trim().length > 0
  );
};

const normalizePrivateKey = (account) => {
  if (account && typeof account.private_key === "string") {
    account.private_key = account.private_key.replace(/\\n/g, "\n");
  }
  return account;
};

const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = parseServiceAccountJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

    if (!serviceAccount || !validateServiceAccount(serviceAccount)) {
      console.error(
        "Firebase service account JSON is missing required fields or is malformed. " +
          "Firebase will not initialize."
      );
      return null;
    }

    return normalizePrivateKey(serviceAccount);
  }

  const localCredentialPath = path.join(__dirname, "firebase-adminsdk.json");
  if (fs.existsSync(localCredentialPath)) {
    const serviceAccount = require(localCredentialPath);
    if (validateServiceAccount(serviceAccount)) {
      return normalizePrivateKey(serviceAccount);
    }

    console.error(
      "Local Firebase service account file is missing required fields. Firebase will not initialize."
    );
  }

  return null;
};

const serviceAccount = getServiceAccount();

if (!getApps().length && serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount),
  });
  console.log("Firebase initialized");
} else if (!serviceAccount) {
  console.warn("Firebase credentials not configured; push notifications are disabled.");
}

module.exports = require("firebase-admin");
