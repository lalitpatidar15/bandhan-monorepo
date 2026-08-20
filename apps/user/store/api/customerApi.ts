import { baseApi } from './baseApi';

export type EnquiryEntityType = 'general' | 'product' | 'service' | 'venue' | 'vendor';

export interface CustomerEnquiry {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  entityType: EnquiryEntityType;
  entityId?: string;
  title?: string;
  requiredDate?: string;
  budget?: number;
  guestCount?: number;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}

export interface CreateEnquiryRequest {
  name?: string;
  email?: string;
  phone?: string;
  entityType: EnquiryEntityType;
  entityId?: string;
  title?: string;
  requiredDate?: string;
  budget?: number;
  guestCount?: number;
  message: string;
}

export interface CustomerAddress {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CustomerAddressInput = Omit<CustomerAddress, '_id' | 'createdAt' | 'updatedAt'>;

export interface SupportTicket {
  _id: string;
  subject: string;
  message: string;
  orderId?: string;
  status: 'open' | 'in_progress' | 'waiting_user' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSupportTicketRequest {
  subject: string;
  message: string;
  orderId?: string;
}

interface CustomerMutationResponse {
  success: boolean;
  message?: string;
}

export const customerApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getEnquiries: builder.query<{ success: boolean; enquiries: CustomerEnquiry[] }, void>({
      query: () => '/customer/enquiries',
      providesTags: ['User'],
    }),
    createEnquiry: builder.mutation<{ success: boolean; enquiry: CustomerEnquiry }, CreateEnquiryRequest>({
      query: (body) => ({ url: '/customer/enquiries', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    getAddresses: builder.query<{ success: boolean; addresses: CustomerAddress[] }, void>({
      query: () => '/customer/addresses',
      providesTags: ['User'],
    }),
    createAddress: builder.mutation<{ success: boolean; address: CustomerAddress }, CustomerAddressInput>({
      query: (body) => ({ url: '/customer/addresses', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateAddress: builder.mutation<{ success: boolean; address: CustomerAddress }, { id: string; data: Partial<CustomerAddressInput> }>({
      query: ({ id, data }) => ({ url: `/customer/addresses/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: builder.mutation<CustomerMutationResponse, string>({
      query: (id) => ({ url: `/customer/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    getTickets: builder.query<{ success: boolean; tickets: SupportTicket[] }, void>({
      query: () => '/customer/support',
      providesTags: ['User'],
    }),
    createTicket: builder.mutation<{ success: boolean; ticket: SupportTicket }, CreateSupportTicketRequest>({
      query: (body) => ({ url: '/customer/support', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetEnquiriesQuery,
  useCreateEnquiryMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetTicketsQuery,
  useCreateTicketMutation,
} = customerApi;
