import type { HTMLAttributes } from "react";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  center?: boolean;
}

const sizeClass = { sm: "bhn-spinner-sm", md: "", lg: "bhn-spinner-lg" };

export function Spinner({ size = "md", center = false, className = "", ...rest }: SpinnerProps) {
  return (
    <div className={[center ? "bhn-spinner-center" : "", className].filter(Boolean).join(" ")} {...rest}>
      <div className={["bhn-spinner", sizeClass[size]].filter(Boolean).join(" ")} />
    </div>
  );
}

export function LoadingState({ label = "Loading", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={["bhn-loading-state", className].filter(Boolean).join(" ")} role="status" aria-live="polite">
      <Spinner size="md" />
      <span>{label}</span>
      <span className="sr-only">Please wait.</span>
    </div>
  );
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: string | number;
  width?: string | number;
  circle?: boolean;
}

export function Skeleton({ height = "1rem", width = "100%", circle = false, className = "", style, ...rest }: SkeletonProps) {
  return (
    <div
      className={["bhn-skeleton", className].filter(Boolean).join(" ")}
      style={{
        height,
        width,
        borderRadius: circle ? "50%" : undefined,
        ...style,
      }}
      {...rest}
    />
  );
}
