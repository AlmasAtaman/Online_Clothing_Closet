"use client";

import UploadForm from "./UploadForm";
import { useEffect } from "react";

type UploadModalProps = {
  show: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
};

export default function UploadModal({ show, onClose, onUploadComplete }: UploadModalProps) {
  // Close on ESC key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (show) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <UploadForm
          onUploadComplete={() => {
            if (onUploadComplete) onUploadComplete();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
