interface BadgeProps {
  children?: React.ReactNode;
  text?: string;
  variant?: 'default' | 'secondary';
}

export default function Badge({ children, text, variant = 'default' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const variantClasses = variant === 'secondary' ? 'bg-[var(--bhn-surface-3)] text-[var(--bhn-text)]' : 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]';
  return <span className={`${baseClasses} ${variantClasses}`}>{children || text}</span>;
}