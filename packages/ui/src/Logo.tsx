export interface LogoProps {
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
  href?: string;
  mark?: string;
}

export function Logo({ size = "md", onDark = false, href, mark = "B" }: LogoProps) {
  const sizeClass = { sm: "bhn-logo-sm", md: "", lg: "bhn-logo-lg" }[size];
  const inner = (
    <>
      <span className="bhn-logo-mark">{mark}</span>
      <span>
        <span className="bhn-logo-text">Bandhan</span>
        <span className="bhn-logo-text-sub">Weddings &amp; Beyond</span>
      </span>
    </>
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