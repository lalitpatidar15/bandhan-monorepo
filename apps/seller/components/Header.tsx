// "use client";

// import Image from "next/image";
// import { useRouter, usePathname } from "next/navigation";

// export default function Header() {
//   const router = useRouter();
//   const pathname = usePathname();

//   const userName =
//     typeof window !== "undefined"
//       ? localStorage.getItem("userName") || "User"
//       : "User";

//   const tabs = [
//     { name: "Orders", path: "/orders" },
//     { name: "Shipping & Delivery", path: "/shipping" },
//     { name: "Returns", path: "/returns" },
//     { name: "Chat", path: "/chat" },
//   ];

//   return (
//     <>
//       {/* TOP BAR */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-4">

//         {/* SEARCH */}
//         <div className="w-full lg:max-w-[420px]">

//           <input
//             placeholder="Search..."
//             className="
//               w-full
//               px-5
//               py-3
//               rounded-xl
//               bg-[var(--bhn-surface-2)]
//               text-sm
//               outline-none
//               focus:ring-2
//               focus:ring-[color-mix(in_srgb,var(--bhn-brand-600)_30%,transparent)]
//             "
//           />

//         </div>

//         {/* RIGHT SECTION */}
//         <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6">

//           {/* ICONS */}
//           <div className="flex items-center gap-4 sm:gap-6">

//             {/* BELL */}
//             <Image
//               src="/bell.png"
//               width={20}
//               height={20}
//               alt="bell"
//               className="cursor-pointer opacity-70 hover:opacity-100 transition"
//             />

//             {/* SETTINGS */}
//             <Image
//               src="/setting.png"
//               width={20}
//               height={20}
//               alt="settings"
//               className="cursor-pointer opacity-70 hover:opacity-100 transition"
//             />

//           </div>

//           {/* USER */}
//           <div className="flex items-center gap-3 sm:gap-4 pl-4 border-l min-w-0">

//             <p className="text-sm font-medium text-[var(--bhn-text)] truncate max-w-[120px] sm:max-w-none">
//               {userName}
//             </p>

//             <Image
//               src="/profile.png"
//               width={36}
//               height={36}
//               alt="profile"
//               className="rounded-full border object-cover"
//             />

//           </div>
//         </div>
//       </div>

//       {/* TABS */}
//       <div className="border-b mb-6 overflow-x-auto">

//         <div className="flex gap-6 sm:gap-10 min-w-max pb-3">

//           {tabs.map((tab) => {
//             const active = pathname.startsWith(tab.path);

//             return (
//               <button
//                 key={tab.name}
//                 onClick={() => router.push(tab.path)}
//                 className={`
//                   relative
//                   pb-2
//                   text-[14px]
//                   sm:text-[15px]
//                   font-medium
//                   whitespace-nowrap
//                   tracking-wide
//                   transition-all
//                   duration-300
//                   cursor-pointer
//                   ${
//                     active
//                       ? "text-[var(--bhn-text)]"
//                       : "text-[var(--bhn-text-muted)] hover:text-[var(--bhn-text)]"
//                   }
//                 `}
//               >
//                 {tab.name}

//                 {/* ACTIVE UNDERLINE */}
//                 <span
//                   className={`
//                     absolute
//                     left-0
//                     -bottom-[6px]
//                     h-[2px]
//                     rounded-full
//                     transition-all
//                     duration-300
//                     ${
//                       active
//                         ? "w-full bg-[var(--bhn-brand-600)]"
//                         : "w-0 bg-transparent"
//                     }
//                   `}
//                 />

//               </button>
//             );
//           })}

//         </div>
//       </div>
//     </>
//   );
// }


"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {

  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");

    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const tabs = [
    { name: "Orders", path: "/orders" },
    { name: "Shipping & Delivery", path: "/shipping" },
    { name: "Returns", path: "/returns" },
    { name: "Chat", path: "/chat" },
  ];

  return (
    <>
      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-4">

        {/* SEARCH */}
        <div className="w-full lg:max-w-[420px]">

          <input
            placeholder="Search..."
            className="
              w-full
              px-5
              py-3
              rounded-xl
              bg-[var(--bhn-surface-2)]
              text-sm
              outline-none
              focus:ring-2
              focus:ring-[color-mix(in_srgb,var(--bhn-brand-600)_30%,transparent)]
            "
          />

        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6">

          {/* ICONS */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* BELL */}
            <Image
              src="/bell.png"
              width={20}
              height={20}
              alt="bell"
              onClick={() => router.push("/chat")}
              className="cursor-pointer opacity-70 hover:opacity-100 transition"
            />

            {/* SETTINGS */}
            <Image
              src="/setting.png"
              width={20}
              height={20}
              alt="settings"
              onClick={() => router.push("/settings")}
              className="cursor-pointer opacity-70 hover:opacity-100 transition"
            />

          </div>

          {/* USER */}
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-3 sm:gap-4 pl-4 border-l min-w-0"
          >

            <p className="text-sm font-medium text-[var(--bhn-text)] truncate max-w-[120px] sm:max-w-none">
              {userName}
            </p>

            <Image
              src="/profile.png"
              width={36}
              height={36}
              alt="profile"
              className="rounded-full border object-cover"
            />

          </button>

        </div>
      </div>

      {/* TABS */}
      <div className="border-b mb-6">

        {/* MOBILE VIEW */}
        <div className="sm:hidden flex flex-col gap-3 pb-4">

          {tabs.map((tab) => {

            const active = pathname.startsWith(tab.path);

            return (
              <button
                key={tab.name}
                onClick={() => router.push(tab.path)}
                className={`
                  w-full
                  h-12
                  rounded-xl
                  text-[14px]
                  font-medium
                  border
                  transition-all
                  duration-300
                  ${active
                    ? "bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] border-[var(--bhn-brand-600)] shadow-md"
                    : "bg-[var(--bhn-surface)] text-[var(--bhn-text-muted)] border-[var(--bhn-border)]"
                  }
                `}
              >
                {tab.name}
              </button>
            );
          })}

        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden sm:flex gap-4 pb-3">

          {tabs.map((tab) => {

            const active = pathname.startsWith(tab.path);

            return (
              <button
                key={tab.name}
                onClick={() => router.push(tab.path)}
                className={`
                  relative
                  pb-2
                  text-[15px]
                  font-medium
                  whitespace-nowrap
                  transition-all
                  duration-300
                  ${active
                    ? "text-[var(--bhn-text)]"
                    : "text-[var(--bhn-text-muted)] hover:text-[var(--bhn-text)]"
                  }
                `}
              >
                {tab.name}

                {/* ACTIVE UNDERLINE */}
                <span
                  className={`
                    absolute
                    left-0
                    -bottom-[6px]
                    h-[2px]
                    rounded-full
                    transition-all
                    duration-300
                    ${active
                      ? "w-full bg-[var(--bhn-brand-600)]"
                      : "w-0 bg-transparent"
                    }
                  `}
                />

              </button>
            );
          })}

        </div>

      </div>
    </>
  );
}
