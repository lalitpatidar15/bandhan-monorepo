import { baseApi } from './baseApi';
import type {
  AddToCartRequest,
  Cart,
  CartItem,
  CartItemType,
  CartMutationResponse,
  CartSummary,
  GetCartResponse,
  RemoveCartItemRequest,
  UpdateCartItemRequest,
} from '@/types/cart';

interface RawCartItem {
  _id?: unknown;
  itemType?: unknown;
  serviceId?: unknown;
  productId?: unknown;
  venueId?: unknown;
  title?: unknown;
  image?: unknown;
  priceAtTime?: unknown;
  price?: unknown;
  quantity?: unknown;
  eventDate?: unknown;
  guests?: unknown;
  packageType?: unknown;
  variant?: unknown;
  rentalDays?: unknown;
  bookingDate?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  guestCount?: unknown;
  location?: unknown;
}

interface RawCartResponse {
  success?: boolean;
  isEmpty?: boolean;
  cart?: {
    _id?: unknown;
    userId?: unknown;
  };
  items?: RawCartItem[];
  summary?: Partial<CartSummary>;
}

interface CheckoutResponse {
  bookingId?: string;
  orderId?: string;
  booking?: { _id?: string };
  message?: string;
}

function identifier(value: unknown): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object' && '_id' in value) {
    const id = (value as { _id?: unknown })._id;
    if (typeof id === 'string' || typeof id === 'number') return String(id);
  }
  return undefined;
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

function normalizeItemType(item: RawCartItem): CartItemType {
  if (item.itemType === 'venue') return 'venue';
  if (item.itemType === 'product') return numberValue(item.rentalDays) > 0 ? 'rental' : 'product';
  return 'service';
}

function normalizeCartItem(item: RawCartItem): CartItem {
  const productId = identifier(item.productId);
  const serviceId = identifier(item.serviceId);
  const venueId = identifier(item.venueId);
  const itemType = normalizeItemType(item);
  const id = productId || serviceId || venueId || identifier(item._id) || '';
  const title = optionalString(item.title) || 'Cart item';
  const image = optionalString(item.image) || '';

  return {
    id,
    productId,
    serviceId,
    venueId,
    name: title,
    title,
    category: itemType,
    price: numberValue(item.priceAtTime ?? item.price),
    quantity: Math.max(1, numberValue(item.quantity) || 1),
    image,
    img: image,
    itemType,
    date: optionalString(item.eventDate ?? item.bookingDate),
    eventDate: optionalString(item.eventDate),
    guests: numberValue(item.guests) || undefined,
    packageType: optionalString(item.packageType),
    bookingDate: optionalString(item.bookingDate),
    startTime: optionalString(item.startTime),
    endTime: optionalString(item.endTime),
    guestCount: numberValue(item.guestCount) || undefined,
    variantName: optionalString(item.variant),
    rentalDays: numberValue(item.rentalDays) || undefined,
    location: optionalString(item.location),
  };
}

function getBackendItemType(itemType: CartItemType): Exclude<CartItemType, 'rental'> {
  return itemType === 'rental' ? 'product' : itemType;
}

function getIdentityBody(itemType: CartItemType, itemId: string | number) {
  const backendType = getBackendItemType(itemType);
  if (backendType === 'product') return { productId: itemId };
  if (backendType === 'venue') return { venueId: itemId };
  return { serviceId: itemId };
}

export const cartApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCart: builder.query<GetCartResponse, void>({
      query: () => '/cart',
      transformResponse: (response: RawCartResponse): GetCartResponse => {
        const items = Array.isArray(response?.items) ? response.items.map(normalizeCartItem) : [];
        const summary: CartSummary = {
          subtotal: numberValue(response?.summary?.subtotal),
          serviceFee: numberValue(response?.summary?.serviceFee),
          tax: numberValue(response?.summary?.tax),
          total: numberValue(response?.summary?.total),
        };
        const cart: Cart = {
          id: identifier(response?.cart?._id) || '',
          userId: identifier(response?.cart?.userId) || '',
          items,
          totalPrice: summary.total,
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
          summary,
        };

        return {
          success: response?.success !== false,
          isEmpty: response?.isEmpty ?? items.length === 0,
          items,
          summary,
          cart,
        };
      },
      providesTags: ['Dashboard'],
    }),

    addToCart: builder.mutation<CartMutationResponse, AddToCartRequest>({
      query: ({ itemId, itemType, quantity = 1, variantName, ...details }) => ({
        url: '/cart/add',
        method: 'POST',
        body: {
          ...getIdentityBody(itemType, itemId),
          quantity,
          eventDate: details.eventDate,
          guests: details.guests,
          packageType: details.packageType,
          variant: variantName,
          rentalDays: details.rentalDays,
          bookingDate: details.bookingDate,
          startTime: details.startTime,
          endTime: details.endTime,
          guestCount: details.guestCount,
        },
      }),
      invalidatesTags: ['Dashboard'],
    }),

    updateCartItem: builder.mutation<CartMutationResponse, UpdateCartItemRequest>({
      query: ({ itemId, itemType, quantity }) => ({
        url: '/cart/update',
        method: 'PUT',
        body: { ...getIdentityBody(itemType, itemId), quantity },
      }),
      invalidatesTags: ['Dashboard'],
    }),

    removeFromCart: builder.mutation<CartMutationResponse, RemoveCartItemRequest>({
      query: ({ itemId, itemType }) => ({
        url: `/cart/remove/${getBackendItemType(itemType)}/${encodeURIComponent(itemId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Dashboard'],
    }),

    clearCart: builder.mutation<CartMutationResponse, void>({
      query: () => ({
        url: '/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Dashboard'],
    }),

    checkout: builder.mutation<{ orderId: string; message: string }, void>({
      query: () => ({
        url: '/cart/create',
        method: 'POST',
      }),
      transformResponse: (response: CheckoutResponse) => ({
        orderId: response.orderId || response.bookingId || response.booking?._id || '',
        message: response.message || 'Booking created',
      }),
      invalidatesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useCheckoutMutation,
} = cartApi;
