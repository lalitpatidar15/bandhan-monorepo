import { baseApi } from './baseApi';

export interface PublicCoupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  applicableCategories?: string[];
  startDate?: string;
  endDate?: string;
}

interface PublicCouponResponse {
  success: boolean;
  data: PublicCoupon[];
}

interface CouponValidationResponse {
  success: boolean;
  data: {
    coupon: Omit<PublicCoupon, '_id'>;
    discount: number;
    finalAmount: number;
  };
}

export const couponApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getActiveCoupons: builder.query<PublicCouponResponse, void>({
      query: () => '/coupons/active',
    }),
    validateCoupon: builder.mutation<CouponValidationResponse, { code: string; orderAmount: number }>({
      query: (body) => ({ url: '/coupons/validate', method: 'POST', body }),
    }),
  }),
});

export const { useGetActiveCouponsQuery, useValidateCouponMutation } = couponApi;
