"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { Button } from "./Button";

export type ConfirmDialogTone = "danger" | "warning" | "info" | "success" | "brand";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: ReactNode;
  message: ReactNode;
  tone?: ConfirmDialogTone;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

const toneIcons: Record<ConfirmDialogTone, ReactNode> = {
  danger: <AlertCircle size={28} className="text-red-600" />,
  warning: <TriangleAlert size={28} className="text-amber-600" />,
  info: <Info size={28} className="text-blue-600" />,
  success: <CheckCircle2 size={28} className="text-green-600" />,
  brand: <Info size={28} className="text-[var(--bhn-brand-600)]" />,
};

const toneIconBg: Record<ConfirmDialogTone, string> = {
  danger: "bg-red-50",
  warning: "bg-amber-50",
  info: "bg-blue-50",
  success: "bg-green-50",
  brand: "bg-[var(--bhn-brand-50)]",
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  tone = "warning",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = tone === "danger" ? "danger" : "primary",
  loading = false,
  icon,
  className = "",
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && !loading) onConfirm();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, onConfirm, loading]);

  if (!open) return null;

  return createPortal(
    <div className="bhn-confirm-dialog" role="alertdialog" aria-modal="true">
      <div className="bhn-confirm-dialog-overlay" onClick={onClose} aria-hidden="true" />
      <div className="bhn-confirm-dialog-content">
        <div className={`bhn-confirm-dialog-icon ${toneIconBg[tone]} rounded-full flex items-center justify-center mx-auto`}>
          {icon ?? toneIcons[tone]}
        </div>
        {title && <h2 className="bhn-confirm-dialog-title">{title}</h2>}
        <p className="bhn-confirm-dialog-message">{message}</p>
        <div className="bhn-confirm-dialog-actions">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}