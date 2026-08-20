"use client";

import React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

export default function ProductMedia({
  images,
  fileInputRef,
  onUpload,
  setImages,
  readOnly,
  onMoveImage,
}: {
  images: string[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setImages: (imgs: string[] | ((prev: string[]) => string[])) => void;
  readOnly?: boolean;
  onMoveImage?: (fromIndex: number, toIndex: number) => void;
}) {
  return (
    <div className="bg-white border border-[#EEE7E1] rounded-2xl p-4 sm:p-7">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-[#F5E9DF] flex items-center justify-center">

            <Image
              src="/image06.png"
              alt="media"
              width={18}
              height={18}
            />
          </div>

          <h2 className="font-serif text-[22px] sm:text-[25px] text-[#2B2B2B] font-semibold">
            Product Media
          </h2>
        </div>

        <span className="text-[11px] tracking-wide text-[#B3AAA3]">
          MAX 5 IMAGES
        </span>
      </div>

      <div
        onClick={() => !readOnly && fileInputRef.current?.click()}
        className={`border-2 border-dashed border-[#DDD4CD] rounded-2xl bg-[#F7F4] p-4 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-300 ${readOnly ? "bg-[#F4F2EE] cursor-not-allowed" : "cursor-pointer hover:bg-[#F7F1EC]"}`}
      >
        <div className="w-16 h-16 rounded-full bg-[#EFE3D8] flex items-center justify-center mb-4">
          <Image src="/image07.png" alt="upload" width={30} height={30} />
        </div>

        <p className="text-[14px] font-medium text-[#2D2D2D]">
          {readOnly ? "View product images" : "Click to upload or drag and drop"}
        </p>
        {!readOnly && (
          <p className="text-[12px] text-[#A59E98] mt-1">PNG, JPG or WEBP (MAX. 5MB)</p>
        )}

        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={onUpload} disabled={readOnly} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-[#E7DDD5] shadow-sm group">
            <Image src={img} alt="product" fill className="object-cover" />

            {i === 0 && (
              <span className="absolute top-2 left-2 bg-[#8A4B2A] text-white text-[10px] px-2 py-[3px] rounded-md">MAIN</span>
            )}

            {!readOnly && (
              <div className="absolute top-2 right-2 flex gap-2">
                {onMoveImage && i > 0 && (
                  <button type="button" onClick={() => onMoveImage(i, i - 1)} className="w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">
                    ↑
                  </button>
                )}
                {onMoveImage && i < images.length - 1 && (
                  <button type="button" onClick={() => onMoveImage(i, i + 1)} className="w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">
                    ↓
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setImages((prev: string[]) => prev.filter((_, index) => index !== i))}
                  className="w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}

        {Array.from({ length: Math.max(0, 5 - images.length) }).map((_, i) => (
          <div
            key={i}
            onClick={() => !readOnly && fileInputRef.current?.click()}
            className={`aspect-square border-2 border-dashed border-[#DDD4CD] rounded-2xl flex flex-col items-center justify-center text-[#B0AAA5] text-sm transition ${readOnly ? "bg-[#F4F2EE] cursor-not-allowed" : "cursor-pointer hover:bg-[#F7F1EC]"}`}
          >
            <Plus size={22} />
            <span className="text-[11px] mt-2">Add Image</span>
          </div>
        ))}
      </div>
    </div>
  );
}
