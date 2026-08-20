"use client";
import { useRef, useState, type ChangeEvent } from "react";
import { Plus, User } from "lucide-react";
import Image from "next/image";

export default function ProfileUpload({
  onUpload,
}: {
  onUpload?: (image: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload?.(url);
  };

  return (
    <div className="w-full border-1 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center gap-2">
      {/* Avatar wrapper */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative cursor-pointer group"
      >
        {/* Outer white circle */}
        <div className="p-1 bg-white rounded-full shadow-sm border">
          {/* Inner avatar circle */}
          <div className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {preview ? (
              <Image src={preview} alt="Selected profile preview" fill sizes="80px" unoptimized className="object-cover" />
            ) : (
              <User size={36} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Brown Plus Icon */}
        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
          <Plus size={12} />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        hidden
        accept="image/*"
        onChange={handleFile}
      />

      <p className="text-gray-500 text-sm">Set profile picture</p>
    </div>
  );
}
