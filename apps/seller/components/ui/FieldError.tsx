import React from "react";

export default function FieldError({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-[var(--bhn-error-600)] mt-2">{children}</p>
  );
}
