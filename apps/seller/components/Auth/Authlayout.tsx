"use client";

import Image from "next/image";

export default function AuthLayout({
  children,
  image,
  position = "left",
  title = "",
  logo = "/Group.png",
}: {
  children: React.ReactNode;
  image: string;
  position?: "left" | "right";
  title?: string;
  logo?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[var(--bhn-bg)]">

      {/* LEFT IMAGE */}
      {position === "left" && (
        <ImageSection image={image} title={title} logo={logo} />
      )}

      {/* FORM SECTION */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-[var(--bhn-bg)]">
        <div className="w-full max-w-md bhn-card bhn-card-pad-lg">{children}</div>
      </div>

      {/* RIGHT IMAGE */}
      {position === "right" && (
        <ImageSection image={image} title={title} logo={logo} />
      )}
    </div>
  );
}


function ImageSection({
  image,
  title,
  logo,
}: {
  image: string;
  title: string;
  logo: string;
}) {
  return (
    <div className="relative w-full md:w-1/2 h-64 md:h-auto hidden md:block">

      {/* BACKGROUND IMAGE (NO BLUR ISSUE) */}
      <Image
        src={image}
        alt="auth"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={75}
        className="object-cover"
      />

      {/* SINGLE OVERLAY */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* CONTENT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
           {/* TITLE */}
        <h1 className="text-xl sm:text-2xl md:text-xl font-bold max-w-sm">
          {title}
        </h1>
        {/* LOGO */}
        <Image
          src={logo}
          alt="logo"
          width={250}
          height={120}
          priority
          className="object-contain mb-6 mt-2 sm:w-36 md:w-44 lg:w-72 h-auto"
        />

      
      </div>
    </div>
  );
}