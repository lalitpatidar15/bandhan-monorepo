export type CartItemType = 'product' | 'venue' | 'service' | 'rental';

export interface CartItem {
  id: string;
  productId?: string;
  serviceId?: string;
  venueId?: string;
  name: string;
  title: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  img: string;
  itemType: CartItemType;
  date?: string;
  eventDate?: string;
  guests?: number;
  packageType?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
  variantName?: string;
  rentalDays?: number;
  location?: string;
}

export interface CartSummary {
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  summary: CartSummary;
}

export interface GetCartResponse {
  success: boolean;
  isEmpty: boolean;
  items: CartItem[];
  summary: CartSummary;
  cart: Cart;
}

export interface AddToCartRequest {
  itemId: string | number;
  itemType: CartItemType;
  quantity?: number;
  eventDate?: string;
  guests?: number;
  packageType?: string;
  variantName?: string;
  rentalDays?: number;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  itemType: CartItemType;
  quantity: number;
}

export interface RemoveCartItemRequest {
  itemId: string;
  itemType: CartItemType;
}

export interface CartMutationResponse {
  success: boolean;
  message: string;
  cart?: unknown;
}
