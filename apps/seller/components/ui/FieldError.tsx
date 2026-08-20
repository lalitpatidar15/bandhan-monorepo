import React from "react";

export default function FieldError({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-red-600 mt-2">{children}</p>
  );
}
