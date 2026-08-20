import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F6EEE7] dark:bg-[#171717] px-6 py-12 text-[#2D1F16] dark:text-[#ededed]">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#E6D8CD] dark:border-[#374151] bg-white dark:bg-[#1a1a1a] p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8B6F63] dark:text-[#a89080]">Bandhan Careers</p>
        <h1 className="mt-3 text-2xl font-semibold">Forgot Password</h1>
        <p className="mt-6 text-sm leading-7 text-[#6B5A4E] dark:text-[#a89080]">Password reset is not self-serve yet. Contact support from your registered company email and we will help restore access securely.</p>
        <a href="mailto:support@bandhan.com?subject=Recruiter%20Password%20Reset" className="mt-6 inline-flex rounded-xl bg-[#7A4B2F] dark:bg-[#b86a3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5F3824] dark:hover:bg-[#a05a30]">Request password reset</a>
        <Link href="/jobposter/login" className="mt-4 block text-sm font-semibold text-[#7A4B2F] dark:text-[#c9a882] hover:underline">← Back to recruiter login</Link>
      </div>
    </main>
  );
}