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
      "border border-[#7A3F23] bg-[#fdf3f1] text-[#4d2016] hover:bg-[#fce7e3] dark:border-[#b86a3a] dark:bg-[#2a1a12] dark:text-[#fce7e3] dark:hover:bg-[#3a2418]",
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
