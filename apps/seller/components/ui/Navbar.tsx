import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-6 py-4 shadow-md">
      <h1 className="text-xl font-bold">Bandhan</h1>
      
      <div className="space-x-6">
        <Link href="/sellerDashboard">Home</Link>
        <Link href="/settings">About</Link>
        <Link href="/chat">Contact</Link>
      </div>
    </div>
  );
}
