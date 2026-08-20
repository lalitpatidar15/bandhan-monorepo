type ProgressbarProps = {
  value: number; // 0 - 100
  showLabel?: boolean;
  className?: string;
};

export default function Progressbar({
  value,
  showLabel = true,
  className = "",
}: ProgressbarProps) {
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}

      <div className="w-full bg-[var(--bhn-surface-3)] rounded-full h-2 overflow-hidden">
        <div
          className="bg-[var(--bhn-brand-500)] h-2 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}