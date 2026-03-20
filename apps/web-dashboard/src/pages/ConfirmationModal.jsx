import React from "react";
import { AlertTriangle } from "lucide-react";

function ConfirmationModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1050]"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] w-[380px] rounded-2xl shadow-lg px-6 py-5 confirmationModal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-red-600 mt-1" size={22} />
          <h2 id="modal-title" className="text-lg font-semibold text-[var(--color-text-main)]">
            {title}
          </h2>
        </div>

        {/* Message */}
        <p id="modal-description" className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6 confirmationModal">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="btn btn-secondary confirmationModalBtn"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="btn btn-danger confirmationModalBtn"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;