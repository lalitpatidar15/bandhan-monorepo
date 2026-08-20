"use client";

import { Video, FileText, BookOpen, Trash2, Edit2 } from "lucide-react";

interface Lesson {
  _id?: string;
  id?: string;
  title: string;
  type?: "video" | "pdf" | "mcq";
  lessonType?: "video" | "pdf" | "mcq";
  videoUrl?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  duration?: string;
  time?: string;
  description?: string;
  mcqData?: any;
}

interface LessonCardProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
  isDeleting?: boolean;
}

const normalizeDurationText = (value: unknown): string | null => {
  if (typeof value === "number") return `${value}`;
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const durationObj = value as { minutes?: unknown; display?: unknown; value?: unknown };
    if (typeof durationObj.minutes === "number") return `${durationObj.minutes}`;
    if (typeof durationObj.display === "string" && durationObj.display.trim()) return durationObj.display.trim();
    if (typeof durationObj.value === "string" && durationObj.value.trim()) return durationObj.value.trim();
    if (typeof durationObj.value === "number") return `${durationObj.value}`;
  }

  return null;
};

export default function LessonCard({
  lesson,
  onEdit,
  onDelete,
  isDeleting = false,
}: LessonCardProps) {
  const hasVideo = Boolean(lesson.videoUrl);
  const hasPdf = Boolean(lesson.pdfUrl || lesson.pdfFileName);
  const lessonType = hasVideo ? "video" : lesson.type || lesson.lessonType || "video";

  let IconComponent = Video;
  let typeLabel = hasVideo ? "Video" : "Video";
  let backgroundColor = "bg-blue-50";
  let borderColor = "border-blue-200";
  let textColor = "text-blue-600";
  let metadata: string | null = null;

  const durationValue = normalizeDurationText(lesson.duration ?? lesson.time);
  const questionCount = lesson.mcqData?.questions?.length ?? 0;

  if (!hasVideo && lessonType === "pdf") {
    IconComponent = FileText;
    typeLabel = "PDF";
    backgroundColor = "bg-red-50";
    borderColor = "border-red-200";
    textColor = "text-red-600";
    metadata = lesson.pdfUrl ? "Activated" : "Not uploaded";
  } else if (lessonType === "mcq") {
    IconComponent = BookOpen;
    typeLabel = "MCQ";
    backgroundColor = "bg-green-50";
    borderColor = "border-green-200";
    textColor = "text-green-600";
    metadata = `${questionCount} ${questionCount === 1 ? "question" : "questions"}`;
  } else {
    metadata = durationValue ? `${durationValue}` : null;
    if (hasPdf && hasVideo) {
      metadata = `${durationValue ? `${durationValue} · ` : ""}PDF attached`;
    }
  }

  return (
    <div
      className={`p-4 rounded-lg border-2 ${borderColor} ${backgroundColor} flex items-start gap-4 hover:shadow-md transition`}
    >
      <div className={`p-3 rounded-lg ${textColor} bg-white border ${borderColor}`}>
        <IconComponent className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-1 bg-white rounded text-gray-700 border border-gray-300">
            {typeLabel}
          </span>
          {metadata && (
            <span className="text-xs text-gray-600">{metadata}</span>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 truncate">{lesson.title}</h3>
        {lesson.description && (
          <p className="text-sm text-gray-600 truncate mt-1">{lesson.description}</p>
        )}
        {lesson.pdfFileName && (
          <p className="text-sm text-gray-600 mt-1">📄 {lesson.pdfFileName}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(lesson)}
          className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(lesson._id || lesson.id || "")}
          disabled={isDeleting}
          className="p-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
