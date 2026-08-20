type Column = {
  key: string;
  label: string;
};

type TableProps = {
  columns: Column[];
  data: any[];
};

export default function Table({ columns, data }: TableProps) {
  return (
    <div className="bhn-table-wrap">
      <table className="bhn-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center text-[var(--bhn-text-soft)]">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}