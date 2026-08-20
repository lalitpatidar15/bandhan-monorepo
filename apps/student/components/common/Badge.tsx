type BadgeProps = {
  text: string;
  variant?: "success" | "warning" | "error" | "info" | "default";
};

export default function Badge({ text, variant = "default" }: BadgeProps) {
  const variants = {
    success: "bhn-badge-success",
    warning: "bhn-badge-warning",
    error: "bhn-badge-danger",
    info: "bhn-badge-info",
    default: "bhn-badge-neutral",
  };

  return <span className={`bhn-badge ${variants[variant]}`}>{text}</span>;
}