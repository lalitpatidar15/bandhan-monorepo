import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ReverseGeocodeResponse {
  latitude?: number;
  longitude?: number;
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  principalSubdivisionCode?: string;
  countryName?: string;
  countryCode?: string;
  postcode?: string;
}

export const locationApi = createApi({
  reducerPath: 'locationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.bigdatacloud.net/data',
  }),
  endpoints: (builder) => ({
    reverseGeocode: builder.query<ReverseGeocodeResponse, { latitude: number; longitude: number }>({
      query: ({ latitude, longitude }) =>
        `/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    }),
  }),
});

export const { useLazyReverseGeocodeQuery } = locationApi;
