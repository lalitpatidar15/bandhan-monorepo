type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block text-sm text-brown-700">
      <span className="mb-2 block uppercase tracking-[0.24em] text-[11px] font-semibold text-brown-500">
        {label}
      </span>
      <input
        className={`w-full rounded-2xl border border-[#DBC1B5] bg-[#FFF8F4]  px-4 py-3 text-sm text-brown-950 outline-none transition focus:border-brown-400 focus:ring-2 focus:ring-brown-100 ${className}`.trim()}
        {...props}
      />
    </label>
  );
}
