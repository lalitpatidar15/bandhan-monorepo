import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const api = read('store/api/couponApi.ts');
const strip = read('components/home/PromoStrip.tsx');

assert.match(api, /\/coupons\/active/);
assert.match(api, /\/coupons\/validate/);
assert.match(strip, /useGetActiveCouponsQuery/);
assert.doesNotMatch(strip, /MONSOON60|up to 60% off/i);

console.log('The storefront promotion is rendered only from an active API coupon.');
