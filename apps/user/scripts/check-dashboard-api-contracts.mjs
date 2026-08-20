import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const rentalApi = await readFile(new URL('../store/api/rentalOrderApi.ts', import.meta.url), 'utf8');
const userApi = await readFile(new URL('../store/api/userApi.ts', import.meta.url), 'utf8');

assert.doesNotMatch(
  rentalApi,
  /\/rental-orders\/user(?:['"`/?]|$)/,
  'buyer rentals must not use the nonexistent /rental-orders/user route',
);
assert.match(
  rentalApi,
  /getUserRentalOrders:[\s\S]*?query:\s*\(\)\s*=>\s*['"]\/rental-orders['"]/,
  'buyer rentals must use GET /rental-orders',
);

for (const route of [
  '/rental-orders/create',
  '/confirm-delivery',
  '/initiate-return',
  '/cancel',
  '/request-extension',
  '/message',
]) {
  assert.ok(rentalApi.includes(route), `rental API adapter is missing ${route}`);
}
assert.match(
  rentalApi,
  /\/rental-orders\/availability\/\$\{productId\}/,
  'rental availability must use the backend product route',
);

assert.match(
  userApi,
  /getOrderTracking:[\s\S]*?async queryFn\(/,
  'order tracking must compose the order and carrier endpoints',
);
assert.match(
  userApi,
  /fetchWithBQ\(`\/orders\/\$\{id\}`\)/,
  'order tracking must fetch the owned order detail',
);
assert.match(
  userApi,
  /fetchWithBQ\(`\/orders\/\$\{id\}\/tracking`\)/,
  'order tracking must fetch carrier tracking data',
);
assert.match(
  userApi,
  /order,\s*\n\s*shipping:/,
  'the combined tracking response must include the order and shipping data',
);

console.log('Rental and order-tracking frontend API contracts are aligned with the backend.');
