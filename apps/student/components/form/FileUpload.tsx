"use client";

import { useState } from "react";

type FileUploadProps = {
  label?: string;
  onChange?: (file: File | null) => void;
  accept?: string; // "image/*"
};

export default function FileUpload({
  label,
  onChange,
  accept = "*",
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      setPreview(URL.createObjectURL(file));
    }

    onChange?.(file);
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <p className="text-sm font-medium mb-1">{label}</p>
      )}

      {/* Input */}
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="block w-full text-sm border rounded-lg p-2 cursor-pointer"
      />

      {/* Preview */}
      {preview && accept.includes("image") && (
        <img
          src={preview}
          alt="preview"
          className="mt-3 h-32 rounded-lg object-cover"
        />
      )}
    </div>
  );
}