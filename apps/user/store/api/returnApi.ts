import { baseApi } from './baseApi';

interface ReturnRequest {
  _id: string;
  requestId: string;
  orderId: string;
  sellerId: string;
  reason: string;
  amount: number;
  customerName?: string;
  productName?: string;
  type: 'Product' | 'Service' | 'Rental';
  requestKind: 'cancel' | 'return';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Refunded';
  createdAt?: string;
}

interface CreateReturnInput {
  orderId?: string;
  reason: string;
  type?: 'Product' | 'Service' | 'Rental';
  requestKind?: 'cancel' | 'return';
}

export const returnApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createReturn: builder.mutation<{ success: boolean; return: ReturnRequest }, CreateReturnInput>({
      query: (body) => ({ url: '/returns/create', method: 'POST', body }),
      invalidatesTags: ['User', 'Dashboard'],
    }),
    getReturns: builder.query<{ success: boolean; returns: ReturnRequest[] }, void>({
      query: () => '/returns',
      providesTags: ['User'],
    }),
  }),
});

export const { useCreateReturnMutation, useGetReturnsQuery } = returnApi;
