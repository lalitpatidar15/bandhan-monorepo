export interface LogoProps {
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
  href?: string;
  mark?: string;
}

export function Logo({ size = "md", onDark = false, href }: LogoProps) {
  const sizeClass = { sm: "bhn-logo-sm", md: "", lg: "bhn-logo-lg" }[size];
  const inner = (
    <img src="/Group1.png" alt="Bandhan Events Hub" className="bhn-logo-image" />
  );
  if (href) {
    return (
      <a href={href} className={["bhn-logo", sizeClass, onDark ? "bhn-logo-onbrand" : ""].filter(Boolean).join(" ")}>
        {inner}
      </a>
    );
  }
  return <span className={["bhn-logo", sizeClass, onDark ? "bhn-logo-onbrand" : ""].filter(Boolean).join(" ")}>{inner}</span>;
}
