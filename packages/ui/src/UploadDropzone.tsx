"use client";

import { useState, useCallback, type ReactNode, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, FileText, Image, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./Button";

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress?: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export interface UploadDropzoneProps {
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  files?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: UploadedFile[]) => Promise<void>;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export function UploadDropzone({
  accept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  multiple = true,
  files: controlledFiles,
  onFilesChange,
  onUpload,
  disabled = false,
  className = "",
  compact = false,
}: UploadDropzoneProps) {
  const [localFiles, setLocalFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const files = controlledFiles ?? localFiles;
  const setFiles = useCallback(
    (newFiles: UploadedFile[]) => {
      if (!controlledFiles) setLocalFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [controlledFiles, onFilesChange]
  );

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }
    if (accept && !accept.split(",").some((type) => file.type.match(type.replace("*", ".*")))) {
      return "File type not allowed";
    }
    return null;
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const currentCount = files.length;
    const availableSlots = maxFiles - currentCount;

    if (availableSlots <= 0) return;

    const validFiles = fileArray.slice(0, availableSlots).map((file) => {
      const error = validateFile(file);
      let preview: string | undefined;
      if (!error && file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file);
      }
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        status: error ? ("error" as const) : ("pending" as const),
        error: error || undefined,
      };
    });

    setFiles([...files, ...validFiles]);
  };

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file?.preview) URL.revokeObjectURL(file.preview);
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && !disabled) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !disabled) {
      addFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0 || !onUpload) return;

    setUploading(true);
    try {
      await onUpload(pendingFiles);
      setFiles(files.map((f) => (f.status === "pending" ? { ...f, status: "complete" as const } : f)));
    } catch (error) {
      setFiles(files.map((f) => (f.status === "pending" ? { ...f, status: "error" as const, error: String(error) } : f)));
    } finally {
      setUploading(false);
    }
  };

  if (compact) {
    return (
      <div className={["bhn-upload-dropzone", dragActive ? "drag-active" : "", className].filter(Boolean).join(" ")}>
        <input type="file" accept={accept} multiple={multiple} onChange={handleFileSelect} className="sr-only" id="upload-input" disabled={disabled || files.length >= maxFiles} />
        <label htmlFor="upload-input" className="cursor-pointer">
          <div className="flex items-center gap-3 p-3">
            <div className="bhn-upload-dropzone-icon">
              <Upload size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[var(--bhn-text)]">Upload files</p>
              <p className="text-xs text-[var(--bhn-text-muted)]">
                {files.length}/{maxFiles} files · Max {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        </label>
        {files.length > 0 && (
          <div className="bhn-upload-dropzone-files">
            {files.map((file) => (
              <div key={file.id} className="bhn-upload-file">
                {file.preview ? (
                  <img src={file.preview} alt={file.file.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <FileText size={16} className="text-[var(--bhn-text-muted)]" />
                )}
                <span className="bhn-upload-file-name">{file.file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="bhn-upload-file-remove"
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={["bhn-upload-dropzone", dragActive ? "drag-active" : "", className].filter(Boolean).join(" ")}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      role="region"
      aria-label="File upload dropzone"
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="sr-only"
        id="upload-input"
        disabled={disabled || files.length >= maxFiles}
      />
      <label htmlFor="upload-input" className="cursor-pointer">
        <div className="bhn-upload-dropzone-icon">
          <Upload size={28} />
        </div>
        <p className="bhn-upload-dropzone-title">
          {dragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="bhn-upload-dropzone-desc">
          or click to browse · Max {Math.round(maxSize / 1024 / 1024)}MB · {multiple ? `Up to ${maxFiles} files` : "Single file"}
        </p>
        {accept && (
          <p className="text-xs text-[var(--bhn-text-soft)] mt-2">
            Accepted: {accept}
          </p>
        )}
      </label>

      {files.length > 0 && (
        <div className="bhn-upload-dropzone-files">
          {files.map((file) => (
            <div key={file.id} className="bhn-upload-file">
              {file.preview ? (
                <img src={file.preview} alt={file.file.name} className="w-10 h-10 rounded object-cover" />
              ) : file.file.type.startsWith("image/") ? (
                <Image size={20} className="text-[var(--bhn-text-muted)]" />
              ) : (
                <FileText size={20} className="text-[var(--bhn-text-muted)]" />
              )}
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="bhn-upload-file-name truncate">{file.file.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[var(--bhn-text-muted)]">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </span>
                  {file.status === "uploading" && (
                    <>
                      <Loader2 size={12} className="animate-spin text-[var(--bhn-brand-600)]" />
                      <span className="text-xs text-[var(--bhn-brand-600)]">Uploading...</span>
                    </>
                  )}
                  {file.status === "complete" && (
                    <CheckCircle2 size={12} className="text-green-600" />
                  )}
                  {file.status === "error" && (
                    <span className="text-xs text-red-600">{file.error}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="bhn-upload-file-remove"
                aria-label={`Remove ${file.file.name}`}
                disabled={file.status === "uploading"}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.some((f) => f.status === "pending") && onUpload && (
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t" style={{ borderColor: "var(--bhn-border)" }}>
          <Button variant="ghost" size="sm" onClick={handleUpload} disabled={uploading} loading={uploading}>
            Upload {files.filter((f) => f.status === "pending").length} file(s)
          </Button>
        </div>
      )}
    </div>
  );
}