"use client";

import Modal from "@/components/Modal";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmModalProps) {
  const variantStyles = {
    danger: "bg-red-500 text-white hover:bg-red-400",
    warning: "bg-amber-500 text-[#050608] hover:bg-amber-400",
    info: "bg-emerald-500 text-[#050608] hover:bg-emerald-400",
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-slate-300">{message}</p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] rounded-lg border border-white/[0.1] bg-[#0D1015] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-slate-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[40px] rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
