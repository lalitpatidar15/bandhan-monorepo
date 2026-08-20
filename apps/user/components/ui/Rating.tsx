// components/Rating.jsx
export default function Rating({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-semibold">{value}</span>
      <span className="text-yellow-500">★★★★★</span>
      <span className="text-gray-500">({count} Reviews)</span>
    </div>
  );
}