export interface Venue {
  _id?: string;
  id?: string;
  name: string;
  location: string;
  guests?: number | string;
  pricePerDay?: number;
  price?: string;
  rating: number;
  tag?: string;
  img?: string;
  image?: string;
  images?: string[];
  description: string;
  tagline?: string;
  features?: string[];
  gallery?: string[];
  serviceFee?: number;
  reviews?: number;
}

export interface VenueFilterParams {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  guestCount?: number;
}

export interface VenueListResponse {
  success: boolean;
  data: Venue[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
