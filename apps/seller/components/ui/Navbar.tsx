import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-6 py-4 shadow-md">
      <Image src="/Group1.png" alt="Bandhan Seller" width={433} height={96} className="h-8 w-auto brightness-0" priority />
      
      <div className="space-x-6">
        <Link href="/sellerDashboard">Home</Link>
        <Link href="/settings">About</Link>
        <Link href="/chat">Contact</Link>
      </div>
    </div>
  );
}
