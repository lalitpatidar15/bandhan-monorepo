interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <div className="space-y-6 bg-white p-4 rounded-2xl border border-white/80">
      <div>
        <h2 className="text-xl font-semibold text-brown-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-brown-700/80">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
