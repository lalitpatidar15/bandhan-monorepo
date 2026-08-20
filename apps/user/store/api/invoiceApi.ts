import { baseApi } from "./baseApi";

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type?: "buy" | "rent" | "service" | "venue";
}

export interface InvoiceRecord {
  _id: string;
  invoiceNo: string;
  orderId?: string;
  items: InvoiceItem[];
  subtotal?: number;
  shipping?: number;
  serviceFee?: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  transactionId?: string;
  paymentStatus?: string;
  status?: string;
  invoiceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InvoiceListResponse {
  success: boolean;
  invoices: InvoiceRecord[];
}

interface InvoiceResponse {
  success: boolean;
  invoice: InvoiceRecord;
}

export const invoiceApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserInvoices: builder.query<InvoiceListResponse, void>({
      query: () => "/invoices/my",
      providesTags: ["Dashboard"],
    }),
    getInvoiceByOrder: builder.query<InvoiceResponse, string>({
      query: (orderId) => `/invoices/order/${orderId}`,
      providesTags: (_result, _error, orderId) => [{ type: "Dashboard", id: `invoice-${orderId}` }],
    }),
  }),
});

export const { useGetUserInvoicesQuery, useGetInvoiceByOrderQuery } = invoiceApi;
