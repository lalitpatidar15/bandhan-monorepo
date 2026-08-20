interface BadgeProps {
  children?: React.ReactNode;
  text?: string;
  variant?: 'default' | 'secondary';
}

export default function Badge({ children, text, variant = 'default' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const variantClasses = variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800';
  return <span className={`${baseClasses} ${variantClasses}`}>{children || text}</span>;
}