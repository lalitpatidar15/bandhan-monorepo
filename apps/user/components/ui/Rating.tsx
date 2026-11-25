// components/Rating.jsx
export default function Rating({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-semibold">{value}</span>
      <span className="text-[var(--bhn-warning-500)]">★★★★★</span>
      <span className="text-[var(--bhn-text-muted)]">({count} Reviews)</span>
    </div>
  );
}