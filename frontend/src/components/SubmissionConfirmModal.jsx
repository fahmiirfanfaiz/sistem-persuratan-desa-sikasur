"use client";

import { Loader2, X } from "lucide-react";

/**
 * Submission Confirmation Modal
 * Sesuai desain Figma node 97-2367
 */
export default function SubmissionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">
            Kirim Permohonan Surat?
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition -mt-0.5"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Pastikan seluruh data pendaftaran dan dokumen yang diunggah sudah
          benar. Setelah dikirim, data tidak dapat diubah.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#e53e3e] hover:bg-[#c53030] rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#e53e3e]/40 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {isLoading ? "Mengirim..." : "Ya, Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}
