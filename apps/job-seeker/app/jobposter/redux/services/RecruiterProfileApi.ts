import { baseApi } from "./BaseApi";

type CompanyProfileResponse = {
  success: boolean;
  message?: string;
  data?: {
    recruiterId: string;
    companyEmail: string;
    companyName: string;
    industry: string;
    companySize: string;
    websiteUrl: string;
    companyLogo: string;
    companyTagline: string;
    description: string;
    headquartersAddress: string;
    additionalLocations: string[];
    profileCompleted: boolean;
    role: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

type SaveCompanyProfilePayload = {
  companyName: string;
  industry: string;
  companySize: string;
  websiteUrl: string;
  companyTagline: string;
  description: string;
  headquartersAddress: string;
  additionalLocations: string;
  companyLogo?: File | null;
};

type CatalogOptionsResponse = { success: boolean; data?: { jobIndustries?: string[]; companySizes?: string[]; jobCategories?: string[]; jobTypes?: string[]; experienceLevels?: string[] } };

export const recruiterProfileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCompanyProfile: build.query<CompanyProfileResponse, void>({
      query: () => ({
        url: "job/get-profile",
        method: "GET",
      }),
    }),
    saveCompanyProfile: build.mutation<CompanyProfileResponse, SaveCompanyProfilePayload>({
      query: (body) => {
        const formData = new FormData();

        formData.append("companyName", body.companyName || "");
        formData.append("industry", body.industry || "");
        formData.append("companySize", body.companySize || "");
        formData.append("websiteUrl", body.websiteUrl || "");
        formData.append("companyTagline", body.companyTagline || "");
        formData.append("description", body.description || "");
        formData.append("headquartersAddress", body.headquartersAddress || "");
        formData.append("additionalLocations", body.additionalLocations || "");

        if (body.companyLogo) {
          formData.append("companyLogo", body.companyLogo);
        }

        return {
          url: "job/company-profile",
          method: "POST",
          body: formData,
        };
      },
    }),
    completeDigiLockerDemo: build.mutation<{ success: boolean; message?: string }, void>({
      query: () => ({ url: "identity-verification/digilocker/demo", method: "POST" }),
    }),
    getCatalogOptions: build.query<CatalogOptionsResponse, void>({ query: () => ({ url: "public/catalog-options", method: "GET" }) }),
  }),
  overrideExisting: false,
});

export const { useGetCompanyProfileQuery, useSaveCompanyProfileMutation, useCompleteDigiLockerDemoMutation, useGetCatalogOptionsQuery } = recruiterProfileApi;
