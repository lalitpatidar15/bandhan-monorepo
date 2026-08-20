"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeable?: boolean;
}

const sizeClass = { sm: "", md: "bhn-modal-md", lg: "bhn-modal-lg", xl: "bhn-modal-xl" };

export function Modal({ open, onClose, title, children, footer, size = "sm", closeable = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeable) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeable, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="bhn-modal-overlay"
      onMouseDown={(e) => {
        if (closeable && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={["bhn-modal", sizeClass[size]].filter(Boolean).join(" ")} role="dialog" aria-modal="true">
        {title != null || closeable ? (
          <div className="bhn-modal-header">
            <h2 className="bhn-modal-title">{title}</h2>
            {closeable ? (
              <button type="button" className="bhn-modal-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="bhn-modal-body">{children}</div>
        {footer ? <div className="bhn-modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
