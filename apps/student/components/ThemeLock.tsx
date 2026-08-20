"use client";

import { useEffect } from "react";

// Dark-mode classes exist in legacy screens, but the theme is not complete.
// Keep the academy consistently light until a complete, tested dark palette is
// introduced across every screen.
export default function ThemeLock() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return null;
}
