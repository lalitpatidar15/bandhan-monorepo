"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES = [
  "/products",
  "/products/Venue",
  "/products/service-listing",
  "/userdashboard/dashboard",
  "/userdashboard/booking",
  "/userdashboard/cart",
  "/userdashboard/checkout",
  "/userdashboard/feed",
  "/userdashboard/notification",
  "/userdashboard/plans",
  "/userdashboard/quote",
  "/vendor/profile",
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
