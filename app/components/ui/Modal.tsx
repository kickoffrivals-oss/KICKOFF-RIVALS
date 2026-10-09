import React, { useEffect } from "react";
import { cn } from "../../lib/utils";
import { IconX } from "../Icons";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  className,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div
        className={cn(
          "relative w-full bg-[#13171F] border border-[#222938] rounded-[6px] shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]",
          maxWidthStyles[maxWidth],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222938] bg-[#0E1218]">
          <div className="flex flex-col gap-0.5">
            <h2 id="modal-title" className="text-base font-bold text-[#FFFFFF] tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[#94A3B8]">
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-[4px] text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#1B212D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 text-sm text-[#F0F4FC]">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 border-t border-[#222938] bg-[#0E1218] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
