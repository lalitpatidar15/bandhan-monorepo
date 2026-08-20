export function Footer() {
  return (
<footer className=" bg-[#FCFAF8]  pt-6 pb-4 text-sm text-brown-700">
  <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 md:flex-row">

    {/* Left */}
    <div className="font-medium text-brown-900">
      Bandhan Careers
    </div>

    {/* Center Links */}
    <div className="flex flex-wrap items-center justify-center gap-6 text-brown-600">
      <span className="cursor-pointer hover:text-brown-900 transition" onClick={() => window.open('/privacy', '_blank')}>Privacy</span>
      <span className="cursor-pointer hover:text-brown-900 transition" onClick={() => window.open('/terms', '_blank')}>Terms</span>
      <span className="cursor-pointer hover:text-brown-900 transition" onClick={() => window.open('/cookie-policy', '_blank')}>Cookie Policy</span>
      <span className="cursor-pointer hover:text-brown-900 transition" onClick={() => window.open('/support', '_blank')}>Support</span>
    </div>

    {/* Right */}
    <div className="text-xs text-brown-500">
      © 2026 Bandhan Careers. Cultivating professional growth.
    </div>

  </div>
</footer>
  );
}
