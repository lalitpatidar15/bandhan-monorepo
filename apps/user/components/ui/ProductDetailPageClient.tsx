"use client";

import { adaptProductDetail, useGetProductByIdQuery } from "@/store/api/productApi";
import ProductDetailLayout from "@/components/ui/ProductDetailLayout";
import SiteHeader from "@/components/ui/SiteHeader";
import Footer from "@/components/ui/Footer";
import { Loader2 } from "lucide-react";

export default function ProductDetailPageClient({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetProductByIdQuery(id);
  const product = data?.data ?? null;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F6F1EA]">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-[#924C2B]"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
        <Footer />
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="min-h-screen bg-[#F6F1EA]">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-[#6B625A]">Product not found.</div>
        <Footer />
      </main>
    );
  }

  const productDetail = adaptProductDetail(product, id);

  return (
    <main className="min-h-screen bg-[#F6F1EA]">
      <SiteHeader />
      <ProductDetailLayout {...productDetail} />
      <Footer />
    </main>
  );
}
