import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#F6EEE7] dark:bg-[#171717] px-6 py-12 text-[#2D1F16] dark:text-[#ededed]">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#E6D8CD] dark:border-[#374151] bg-white dark:bg-[#1a1a1a] p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8B6F63] dark:text-[#a89080]">Bandhan Careers</p>
        <h1 className="mt-3 text-2xl font-semibold">Cookie Policy</h1>
        <p className="mt-6 text-sm leading-7 text-[#6B5A4E] dark:text-[#a89080]">We use essential cookies and local storage to keep recruiter sessions active, preserve workspace preferences, and protect secure access to the platform.</p>
        <Link href="/jobposter/login" className="mt-4 inline-flex text-sm font-semibold text-[#7A4B2F] dark:text-[#c9a882] hover:underline">← Back to recruiter login</Link>
      </div>
    </main>
  );
}