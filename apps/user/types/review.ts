export interface Review {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'venue' | 'vendor' | 'service';
  rating: number;
  title: string;
  description: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  itemId: string;
  itemType: 'venue' | 'vendor' | 'service';
  rating: number;
  title: string;
  description: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  description?: string;
}

export interface ReviewResponse {
  review: Review;
  message: string;
}

export interface ItemReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface ProductReview {
  _id: string;
  productId: string;
  sellerId: string;
  userId?: string;
  customerName?: string;
  customerImage?: string;
  productName?: string;
  rating: number;
  title?: string;
  comment: string;
  sellerReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  total: number;
  averageRating: number;
}

export interface CreateProductReviewRequest {
  productId: string;
  sellerId?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  productName?: string;
  rating: number;
  title?: string;
  comment: string;
}
