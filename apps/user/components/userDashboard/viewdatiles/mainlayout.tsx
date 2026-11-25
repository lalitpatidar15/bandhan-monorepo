import type { ReactNode } from "react";


import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bhn-surface-2)]">
      <header className="sticky top-0 z-20 w-full bg-[var(--bhn-surface)] border-b border-[var(--bhn-border)]">
             <Header variant="main1" showCart={true} />
           </header>
      <main className="flex-1">
        {children}
      </main>
         <footer className="mb-1">
     <Footer variant="viewdetails" />
            </footer>
    </div>
  );
}