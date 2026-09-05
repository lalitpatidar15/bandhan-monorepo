"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";

export type DrawerSide = "right" | "left" | "bottom";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: DrawerSide;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeable?: boolean;
  showOverlay?: boolean;
  className?: string;
}

const sideClass: Record<DrawerSide, string> = {
  right: "bhn-drawer-right",
  left: "bhn-drawer-left",
  bottom: "bhn-drawer-bottom",
};

const sizeClass: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "bhn-drawer-right max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
  size = "md",
  closeable = true,
  showOverlay = true,
  className = "",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeable) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeable, onClose]);

  if (!open) return null;

  const drawerContent = (
    <>
      {showOverlay && (
        <div className="bhn-drawer-overlay" onClick={closeable ? onClose : undefined} aria-hidden="true" />
      )}
      <div
        className={[
          "bhn-drawer",
          sideClass[side],
          sizeClass[size],
          className,
        ].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
      >
        {(title || closeable) && (
          <div className="bhn-drawer-header">
            {title && <h2 id="drawer-title" className="bhn-drawer-title">{title}</h2>}
            {closeable && (
              <button
                type="button"
                className="bhn-drawer-close"
                onClick={onClose}
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="bhn-drawer-body">{children}</div>
        {footer && <div className="bhn-drawer-footer">{footer}</div>}
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}