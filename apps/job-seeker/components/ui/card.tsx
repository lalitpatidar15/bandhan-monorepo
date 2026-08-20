type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={` border border-white/80 dark:border-white/10 bg-white dark:bg-[#171717] p-5 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
