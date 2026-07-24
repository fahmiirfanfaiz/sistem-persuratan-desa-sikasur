"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Clock
} from "lucide-react";

function formatDate(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function DetailJenisSuratPage() {
  const { id } = useParams();
  const router = useRouter();

  const [letterType, setLetterType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/api/admin/letter-types/${id}`);
        const json = await res.json();
        if (json.success) {
          setLetterType(json.data);
        } else {
          setError(json.message || "Gagal memuat data");
        }
      } catch {
        setError("Gagal terhubung ke server");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 size={32} className="animate-spin text-[#1a2e6f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <AlertCircle size={40} className="text-red-400 mb-3" />
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-lg hover:bg-[#1a2e6f]/5 transition">Kembali</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2e6f] transition mb-5"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {/* Detail Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1a2e6f]/10 flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-[#1a2e6f]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{letterType.name}</h1>
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 mt-1">
              Kategori: {letterType.letterCategory?.name || "-"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1">Deskripsi</p>
            <p className="text-sm font-medium text-gray-800">{letterType.description || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Nama File Template</p>
            {letterType.templatePath ? (
              <span className="text-sm font-medium text-gray-800 font-mono">{letterType.templatePath}</span>
            ) : (
              <span className="text-sm text-gray-400 italic">Tidak ada template</span>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Dibuat Pada</p>
            <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              {formatDate(letterType.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Terakhir Diperbarui</p>
            <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              {formatDate(letterType.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
