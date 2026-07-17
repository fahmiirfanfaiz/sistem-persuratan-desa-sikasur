"use client";

import { LogOut, X } from "lucide-react";

/**
 * Logout Confirmation Modal
 * Sesuai desain Figma node 70-715
 */
export default function LogoutModal({ isOpen, onClose, onConfirm }) {
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
            Konfirmasi Keluar
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition -mt-0.5"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Apakah Anda yakin ingin keluar? Anda perlu masuk kembali untuk
          mengakses akun Anda.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#e53e3e] hover:bg-[#c53030] rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#e53e3e]/40"
          >
            <LogOut size={15} />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
