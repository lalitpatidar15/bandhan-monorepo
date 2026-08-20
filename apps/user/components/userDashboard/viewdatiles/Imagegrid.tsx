export function ImageGrid({ images }: any) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-5">

      {/* Big Image */}
      <img
        src={images[0]}
        className="col-span-1 row-span-2 rounded-2xl object-cover h-full w-full"
      />

      {/* Right side */}
            <div className="grid grid-cols-2 gap-4">

      <img src={images[1]} className="rounded-2xl object-cover h-full w-full" />
        <img src={images[2]} className="rounded-2xl object-cover" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <img src={images[4]} className="rounded-2xl object-cover" />

        <div className="relative">
          <img src={images[0]} className="rounded-2xl object-cover" />

          <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full text-xs shadow">
            View all 48 photos
          </div>
        </div>
      </div>
    </div>
  );
}