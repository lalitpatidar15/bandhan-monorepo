"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES = [
  "/sellerDashboard",
  "/orders",
  "/shipping",
  "/returns",
  "/chat",
  "/inventory",
  "/inventory/add-product",
  "/inventory/inventory-management",
  "/earnings",
  "/earnings/commission",
  "/reviews",
  "/settings",
];

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ROUTES.forEach((route) => router.prefetch(route));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
