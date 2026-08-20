import { baseApi } from "./baseApi";

export interface ProductSpecification {
  name?: string;
  label?: string;
  value?: string | number;
}

export interface ProductRecord {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  images?: string[];
  image?: string;
  rating?: number | string;
  reviewCount?: number | string;
  location?: string;
  price?: number | string;
  discountPrice?: number | string;
  rentalPrice?: number | string;
  rentPrice?: number | string;
  rentalDuration?: string;
  productType?: string;
  type?: string;
  sellerName?: string;
  vendorName?: string;
  company?: string;
  category?: string;
  subCategory?: string;
  stockStatus?: string;
  orders?: number | string;
  soldCount?: number | string;
  shippingRequired?: boolean;
  shippingCost?: number | string;
  freeShipping?: boolean;
  returnPolicy?: string;
  warranty?: string;
  brand?: string;
  sku?: string;
  specifications?: ProductSpecification[];
}

export interface ProductDetailViewModel {
  title: string;
  description: string;
  images: string[];
  rating?: number;
  location?: string;
  price: number;
  priceLabel?: string;
  providerName?: string;
  reviewCount?: number;
  details: Array<{ label: string; value: string }>;
  productId: string;
  category?: string;
  subCategory?: string;
  type?: string;
  availability?: string;
  shipping?: string;
  returnPolicy?: string;
  warranty?: string;
  soldCount?: number;
}

interface ProductResponse {
  success: boolean;
  data: ProductRecord;
}

interface ProductMutationResponse {
  success: boolean;
  data?: ProductRecord;
  message: string;
}

export interface ProductListResponse {
  success: boolean;
  data: ProductRecord[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const optionalNumber = (value: unknown): number | undefined => {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const nonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const readableValue = (value: unknown): string | undefined => {
  const normalized = nonEmptyString(value);
  if (!normalized) return undefined;
  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export function adaptProductDetail(product: ProductRecord, fallbackId = ""): ProductDetailViewModel {
  const productType = nonEmptyString(product.productType || product.type)?.toLowerCase();
  const salePrice = optionalNumber(product.discountPrice) || optionalNumber(product.price) || 0;
  const rentalPrice = optionalNumber(product.rentalPrice) || optionalNumber(product.rentPrice);
  const price = productType === "rent" || productType === "rental" ? rentalPrice ?? salePrice : salePrice;
  const soldCount = optionalNumber(product.orders ?? product.soldCount);
  const shippingCost = optionalNumber(product.shippingCost);

  let shipping: string | undefined;
  if (product.shippingRequired === false) shipping = "Shipping not required";
  else if (product.freeShipping === true) shipping = "Free shipping";
  else if (product.shippingRequired === true && shippingCost !== undefined && shippingCost > 0) {
    shipping = `₹${shippingCost.toLocaleString("en-IN")} shipping`;
  }

  let type: string | undefined;
  if (productType === "sale") type = "For sale";
  else if (productType === "rent" || productType === "rental") type = "For rent";
  else if (productType === "both") type = "For sale or rent";

  const details = (Array.isArray(product.specifications) ? product.specifications : [])
    .map((specification) => ({
      label: nonEmptyString(specification?.name || specification?.label),
      value: specification?.value === undefined || specification?.value === null
        ? undefined
        : nonEmptyString(String(specification.value)),
    }))
    .filter((detail): detail is { label: string; value: string } => Boolean(detail.label && detail.value));

  const brand = nonEmptyString(product.brand);
  const sku = nonEmptyString(product.sku);
  if (brand) details.push({ label: "Brand", value: brand });
  if (sku) details.push({ label: "SKU", value: sku });

  const images = Array.isArray(product.images)
    ? product.images.filter((image): image is string => Boolean(nonEmptyString(image)))
    : [];
  const singleImage = nonEmptyString(product.image);
  if (images.length === 0 && singleImage) images.push(singleImage);

  return {
    title: nonEmptyString(product.title || product.name) || "Untitled product",
    description: nonEmptyString(product.description) || "",
    images,
    rating: optionalNumber(product.rating),
    location: nonEmptyString(product.location),
    price,
    priceLabel: productType === "rent" || productType === "rental"
      ? `Rental price${nonEmptyString(product.rentalDuration) ? ` / ${product.rentalDuration}` : ""}`
      : productType === "both"
        ? "Purchase price"
        : undefined,
    providerName: nonEmptyString(product.sellerName || product.vendorName || product.company),
    reviewCount: optionalNumber(product.reviewCount),
    details,
    productId: nonEmptyString(product._id || product.id) || fallbackId,
    category: nonEmptyString(product.category),
    subCategory: nonEmptyString(product.subCategory),
    type,
    availability: readableValue(product.stockStatus),
    shipping,
    returnPolicy: nonEmptyString(product.returnPolicy),
    warranty: nonEmptyString(product.warranty),
    soldCount: soldCount !== undefined && soldCount > 0 ? soldCount : undefined,
  };
}

export const productApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, Record<string, unknown> | void>({
      query: (params) => ({
        url: "/public/catalog/products",
        params: params || undefined,
      }),
      providesTags: ["Vendors"],
    }),
    getProductById: builder.query<ProductResponse, string>({
      query: (id) => `/public/catalog/products/${encodeURIComponent(id)}`,
      providesTags: (result, error, id) => [{ type: "Vendors", id }],
    }),
    getSimilarProducts: builder.query<ProductListResponse, { category: string; exclude: string; limit?: number }>({
      query: ({ category, exclude, limit = 4 }) => ({
        url: "/public/catalog/products",
        params: { category, exclude, limit },
      }),
      providesTags: ["Vendors"],
    }),
    getProductCategories: builder.query<{ success: boolean; data: string[] }, void>({
      query: () => ({ url: "/public/catalog/products", params: { limit: 48 } }),
      transformResponse: (response: ProductListResponse) => ({
        success: response.success,
        data: [...new Set((response.data || []).map((product) => product.category).filter((category): category is string => Boolean(category)))],
      }),
    }),
    getProductBrands: builder.query<{ success: boolean; data: string[] }, void>({
      query: () => "/products/brands",
    }),
    createProduct: builder.mutation<ProductMutationResponse, FormData>({
      query: (body) => ({
        url: "/products/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vendors"],
    }),
    updateProduct: builder.mutation<ProductMutationResponse, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Vendors"],
    }),
    deleteProduct: builder.mutation<ProductMutationResponse, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vendors"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetSimilarProductsQuery,
  useGetProductCategoriesQuery,
  useGetProductBrandsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
