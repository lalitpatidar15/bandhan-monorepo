export type CustomerLike = Record<string, unknown> | null | undefined;

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

export function getCustomerName(source: CustomerLike | any): string {
  if (!source || typeof source !== "object") {
    return "Guest Customer";
  }

  const record = source as Record<string, any>;
  const user = toRecord(record.userId) || toRecord(record.user) || toRecord(record.buyerId) || toRecord(record.customerId) || null;
  const customer = toRecord(record.customer);
  const buyer = toRecord(record.buyer);
  const shippingAddress =
    toRecord(record.shippingAddress) ||
    toRecord(record.shipping_address) ||
    null;
  const billingAddress =
    toRecord(record.billingAddress) ||
    toRecord(record.billing_address) ||
    null;

  const nameCandidates = [
    record.customerName,
    record.buyerName,
    record.payerName,
    record.userName,
    record.name,
    record.fullName,
    record.customer,
    record.buyer,
    customer?.name,
    customer?.fullName,
    buyer?.name,
    buyer?.fullName,
    user?.name,
    user?.fullName,
    user?.email,
    user?.phone,
    shippingAddress?.fullName,
    shippingAddress?.name,
    billingAddress?.fullName,
    billingAddress?.name,
    record.shippingAddress?.name,
    record.shippingAddress?.fullName,
    record.shipping_address?.name,
    record.shipping_address?.fullName,
    record.billingAddress?.name,
    record.billingAddress?.fullName,
    record.customer?.buyerName,
    record.buyer?.buyerName,
  ];

  const name = nameCandidates.find((value) => typeof value === "string" && String(value).trim().length > 0);

  return String(name || "Guest Customer").trim();
}

export function getCustomerFirstLast(source: CustomerLike ) {
  const fullName = getCustomerName(source);
  const parts = fullName.split(" ").filter(Boolean);
  return {
    first: parts[0] || "Guest",
    last: parts.slice(1).join(" ") || "Customer",
    fullName,
  };
}
