import React from "react";

interface TableProps<T> {
  columns: Array<{ title: string; key: string }>;
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export default function Table<T>({
  columns,
  data,
  renderRow,
  className = "",
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-[var(--bhn-border)]">
        <thead className="bg-[var(--bhn-surface-2)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[1px] text-[var(--bhn-text-muted)]"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[var(--bhn-surface)] divide-y divide-[var(--bhn-border)]">
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
}
