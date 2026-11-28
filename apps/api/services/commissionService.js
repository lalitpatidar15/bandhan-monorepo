const CommissionRule = require("../models/shared/CommissionRule.js");
const configService = require("./configService.js");

// Settings and seeded rules store percentages as either 10 or 0.10.
function normalizeRate(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return fallback;
  return numeric > 1 ? numeric / 100 : numeric;
}

async function platformRate() {
  try {
    return normalizeRate(await configService.getSetting("commissionRate"), 0.1);
  } catch (error) {
    console.error("Unable to load platform commission rate:", error);
    return 0.1;
  }
}

// Returns a fractional rate (0.1 === 10%). Fixed-amount rules cannot be
// expressed as a rate, so they fall back to the platform percentage.
async function getCommissionRate(category) {
  const fallback = await platformRate();
  if (!category) return fallback;

  let rules = [];
  try {
    rules = await CommissionRule.find({ isActive: { $ne: false } }).lean();
  } catch (error) {
    console.error("Unable to load commission rules:", error);
    return fallback;
  }

  const name = String(category).trim();
  const lowered = name.toLowerCase();
  const eligible = rules.filter((rule) => rule.type !== "fixed");
  const exact = eligible.find((rule) => String(rule.category || "").trim() === name);
  const match = exact || eligible.find(
    (rule) => String(rule.category || "").trim().toLowerCase() === lowered
  );

  return match ? normalizeRate(match.value, fallback) : fallback;
}

async function calculateCommission(category, amount) {
  const rate = await getCommissionRate(category);
  const value = Number(amount) || 0;
  const commission = Math.round(value * rate * 100) / 100;
  const net = Math.round((value - commission) * 100) / 100;
  return { rate, commission, net };
}

module.exports = { getCommissionRate, calculateCommission };
