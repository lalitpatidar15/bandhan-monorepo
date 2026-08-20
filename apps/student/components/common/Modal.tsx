"use client";

import React from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="bhn-modal-overlay">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bhn-modal relative">
        <div className="bhn-modal-header">
          {title && <h2 className="bhn-modal-title">{title}</h2>}
          <button onClick={onClose} className="bhn-modal-close">
            ✕
          </button>
        </div>

        <div className="bhn-modal-body">{children}</div>
      </div>
    </div>
  );
}