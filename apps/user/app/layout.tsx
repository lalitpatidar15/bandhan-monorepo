import "@bandhan/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import AppShellClient from "@/components/AppShellClient";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--bhn-font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--bhn-font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bandhan — Weddings & Beyond",
  description: "Products, rentals, services and venues for weddings and events, plus courses and careers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <AppShellClient>{children}</AppShellClient>
      </body>
    </html>
  );
}