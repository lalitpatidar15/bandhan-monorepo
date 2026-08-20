"use client";

import ReduxProvider from "./redux/provider";

export default function JobPosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
