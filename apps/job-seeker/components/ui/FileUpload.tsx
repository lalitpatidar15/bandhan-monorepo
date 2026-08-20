import { useState, useRef } from "react";
import { useDeleteResumeMutation } from "../../app/Jobseeker/redux/services/ProfileApi";

interface FileUploadProps {
  label: string;
  description?: string;
  onFileSelect: (file: File | null) => void;
  acceptedFormats?: string;
  maxSize?: number; // in MB
  existingResume?: { fileName: string; resumeUrl: string };
  onExistingResumeDeleted?: () => void;
}

export function FileUpload({
  label,
  description,
  onFileSelect,
  acceptedFormats = ".pdf,.doc,.docx",
  maxSize = 5,
  existingResume,
  onExistingResumeDeleted,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteResume] = useDeleteResumeMutation();
  const displayedFileName = selectedFile?.name || existingResume?.fileName;
  const hasDisplayedFile = Boolean(selectedFile || existingResume);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    const fileSize = file.size / (1024 * 1024); // Convert to MB

    if (fileSize > maxSize) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const removeFile = async () => {
    if (selectedFile) {
      setSelectedFile(null);
      onFileSelect(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!existingResume) return;
    setIsDeleting(true);

    try {
      await deleteResume().unwrap();
      onExistingResumeDeleted?.();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Resume delete failed", error);
      alert("Unable to delete resume. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <div>
          <h3 className="text-xl font-semibold text-brown-950">{label}</h3>
          {description && <p className="mt-1 text-sm text-brown-700/80">{description}</p>}
        </div>
      )}

      {!hasDisplayedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-3xl border-2 border-dashed p-5 sm:p-12 text-center transition cursor-pointer ${
            isDragging
              ? "border-brown-400 bg-[#F5E8DC]"
              : "border-[#D4C4B8] bg-white hover:border-brown-400"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE4CC]">
              <svg
                className="h-8 w-8 text-[#C89A6F]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-brown-950">
                Drag & drop your resume here or click to upload
              </p>
              <p className="mt-2 text-sm text-brown-700/70">
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-3 rounded-2xl bg-[#8B3E05] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#6B2E04]"
            >
              Upload File
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="rounded-3xl border border-[#E8D8CC] bg-[#FFF4EE] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFE4CC] flex-shrink-0">
                <svg
                  className="h-6 w-6 text-[#C89A6F]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                </svg>
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-brown-950 truncate">{displayedFileName}</p>
                  <span className="text-[#D27E2C] text-xs">✓</span>
                </div>
                {selectedFile && <p className="text-xs text-brown-700/70 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} MB • Uploaded just now
                </p>}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-shrink-0">
              {existingResume && !selectedFile && (
                <a
                  href={existingResume.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto rounded-lg bg-[#FFE4CC] px-4 py-2 text-center text-xs font-semibold text-[#8B3E05] transition hover:bg-[#F5D5B3]"
                >
                  VIEW
                </a>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto rounded-lg bg-[#FFE4CC] px-4 py-2 text-xs font-semibold text-[#8B3E05] transition hover:bg-[#F5D5B3]"
              >
                {existingResume && !selectedFile ? "REPLACE" : "CHANGE"}
              </button>
              <button
                type="button"
                onClick={removeFile}
                disabled={isDeleting}
                className="w-full sm:w-auto rounded-lg text-xs font-semibold text-brown-700 transition hover:text-brown-900 px-2 py-2 disabled:opacity-60"
              >
                {isDeleting ? "DELETING..." : selectedFile ? "CANCEL" : "DELETE"}
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
