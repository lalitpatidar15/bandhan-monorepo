import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cartApi = await readFile(new URL('../store/api/cartApi.ts', import.meta.url), 'utf8');
const cartPage = await readFile(new URL('../components/userDashboard/CartPageClient.tsx', import.meta.url), 'utf8');
const cartContext = await readFile(new URL('../context/CartContext.tsx', import.meta.url), 'utf8');

assert.match(cartApi, /query:\s*\(\)\s*=>\s*['"]\/cart['"]/, 'cart query must use GET /cart');
for (const field of ['subtotal', 'serviceFee', 'tax', 'total']) {
  assert.match(cartApi, new RegExp(`summary\\?\\.${field}`), `cart adapter must preserve backend summary.${field}`);
}
assert.match(
  cartApi,
  /body:\s*\{\s*\.\.\.getIdentityBody\(itemType, itemId\), quantity \}/,
  'quantity updates must send the correct entity ID field',
);
assert.match(
  cartApi,
  /`\/cart\/remove\/\$\{getBackendItemType\(itemType\)\}\/\$\{encodeURIComponent\(itemId\)\}`/,
  'removal must use the product, service, or venue route',
);
assert.doesNotMatch(cartApi, /url:\s*`\/cart\/remove\/\$\{(?:cart)?itemId\}`/, 'generic remove route must not be used');

assert.match(cartPage, /const items = cartData\?\.items \|\| \[\]/, 'dashboard cart must render server items');
assert.match(cartPage, /summary\?\.serviceFee/, 'dashboard cart must render the backend service fee');
assert.match(cartPage, /summary\?\.tax/, 'dashboard cart must render the backend tax');
assert.match(cartPage, /summary\?\.total/, 'dashboard cart must render the backend total');
assert.match(cartPage, /updateCartItem\(\{ itemId: item\.id, itemType: item\.itemType, quantity \}\)/, 'quantity controls must call the API');
assert.match(cartPage, /removeFromCart\(\{ itemId: item\.id, itemType: item\.itemType \}\)/, 'remove controls must call the API');
assert.match(cartPage, /router\.push\('\/userdashboard\/checkout'\)/, 'checkout navigation must not serialize cart totals into the URL');

for (const fakeValue of ['0.05', '0.08', 'Trending collections', 'The Gilded Ballroom', 'WELCOME10', 'FLAT100', 'BANDHAN20']) {
  assert.doesNotMatch(cartPage + cartContext, new RegExp(fakeValue.replace('.', '\\.')), `legacy cart fixture remains: ${fakeValue}`);
}
assert.doesNotMatch(cartPage, /\?items=|itemsParam|total=\$\{/, 'dashboard cart must not pass client totals to checkout');
assert.match(cartContext, /const GUEST_CART_KEY = ['"]bandhanGuestCart['"]/, 'signed-out cart must use an explicit guest-only key');
assert.match(cartContext, /isAuthenticated \? \(serverCart\?\.items \|\| \[\]\)/, 'authenticated context must read server cart items');
assert.doesNotMatch(cartContext, /bandhanCart|bandhanCoupon|NEXT_PUBLIC_TAX_RATE/, 'authenticated/local legacy cart calculations must be removed');

console.log('Customer cart is server-authoritative after login and uses type-specific API mutations.');
