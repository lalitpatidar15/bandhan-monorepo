import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
const [productApi, checkout, confirmation, productDetail] = await Promise.all([
  read("store/api/productApi.ts"),
  read("app/userdashboard/checkout/page.tsx"),
  read("app/userdashboard/confirmation/page.tsx"),
  read("components/ui/ProductDetailLayout.tsx"),
]);

assert.match(productApi, /url: "\/public\/catalog\/products"/);
assert.match(productApi, /encodeURIComponent\(id\)/);
assert.doesNotMatch(productApi, /url: "\/products"/);
assert.doesNotMatch(checkout, /searchParams\.get\(["'](?:amount|total|items)/);
assert.match(checkout, /useGetCheckoutQuoteQuery/);
assert.doesNotMatch(confirmation, /searchParams\.get\(["'](?:amount|paymentId|itemCount)/);
assert.match(confirmation, /useGetUserOrdersQuery/);
assert.doesNotMatch(productDetail, /itemsParam|totalParam/);
assert.match(productApi, /rentalPrice,/);
assert.match(productApi, /rentalDuration:/);
assert.match(productDetail, /itemType: activeItemType/);
assert.match(productDetail, /rentalDays: purchaseMode === "rent"/);

console.log("Public products remain moderated; sale and rental carts use owned API records and the existing cart contract.");
