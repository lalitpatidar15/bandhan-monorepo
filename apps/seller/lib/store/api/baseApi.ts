import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = (() => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || `${window.location.origin}/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
})();

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token =
          localStorage.getItem("sellerToken") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["RentalOrders"],
  endpoints: () => ({}),
});

export default baseApi;
