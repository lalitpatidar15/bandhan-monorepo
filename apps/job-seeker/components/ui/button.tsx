type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown-700 disabled:opacity-50";

  const variantStyles = {
    primary:
      "bg-[#7A3F23] text-white shadow-sm hover:bg-[#5D2E1A] dark:bg-[#b86a3a] dark:hover:bg-[#a05a30]",
    secondary:
      "border border-[#DBC1B5] bg-white text-[#554339] hover:bg-[#F9F2EB] dark:border-[#374151] dark:bg-[#1a1a1a] dark:text-[#d1c4b8] dark:hover:bg-[#2a2a2a]",
    ghost:
      "bg-transparent text-[#554339] hover:bg-[#F9F2EB] dark:text-[#d1c4b8] dark:hover:bg-[#2a2a2a]",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${fullWidth ? "w-full" : "inline-flex"} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
