"use client";

import UploadForm from "./UploadForm";
import { useEffect, useRef } from "react";

type UploadModalProps = {
  show: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
};

export default function UploadModal({ show, onClose, onUploadComplete }: UploadModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (show) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show, onClose]);


    useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-[#1f1f1f] text-white rounded-lg p-6 w-full max-w-md shadow-lg relative border border-gray-700"
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
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
