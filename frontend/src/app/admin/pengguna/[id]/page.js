"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  User,
  Loader2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  FileText
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

const STATUS_BADGE = {
  PENDING: { label: "Menunggu", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  ON_PROCESS: { label: "Diproses", cls: "bg-blue-50 text-blue-600 border-blue-200" },
  APPROVED: { label: "Disetujui", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  REJECTED: { label: "Ditolak", cls: "bg-red-50 text-red-600 border-red-200" },
  COMPLETED: { label: "Selesai", cls: "bg-violet-50 text-violet-600 border-violet-200" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.PENDING;
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function DetailPenggunaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/api/admin/users/${id}`);
        const json = await res.json();
        if (json.success) {
          setUser(json.data);
        } else {
          setError(json.message || "Gagal memuat data pengguna");
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
    <div className="max-w-5xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2e6f] transition mb-5"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#1a2e6f] text-white text-3xl font-bold flex items-center justify-center mb-4">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              
              <div className="mt-4 flex gap-2">
                <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${user.role === "ADMIN" ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {user.role}
                </span>
                <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${user.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {user.isActive ? "Aktif" : "Non-aktif"}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5"><FileText size={14} /> NIK</p>
                <p className="text-sm font-medium text-gray-800">{user.nik || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5"><FileText size={14} /> No KK</p>
                <p className="text-sm font-medium text-gray-800">{user.familyCardNumber || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5"><Phone size={14} /> Telepon</p>
                <p className="text-sm font-medium text-gray-800">{user.phoneNumber || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5"><MapPin size={14} /> Alamat</p>
                <p className="text-sm font-medium text-gray-800">{user.address || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5"><Clock size={14} /> Terdaftar Sejak</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Riwayat Permohonan Surat</h3>
            
            {!user.submissions || user.submissions.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">
                <p className="text-sm text-gray-400">Pengguna belum mengajukan permohonan surat.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {user.submissions.map((sub) => (
                  <div key={sub.id} className="p-4 border border-gray-100 rounded-xl hover:border-[#1a2e6f]/30 transition bg-gray-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{sub.letterType?.name || "Surat"}</h4>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(sub.createdAt)}</p>
                      </div>
                      <StatusBadge status={sub.status} />
                    </div>
                    {sub.purpose && (
                      <p className="text-sm text-gray-600 mt-3 border-t border-gray-100 pt-3">
                        <span className="font-medium">Keperluan:</span> {sub.purpose}
                      </p>
                    )}
                    <div className="mt-4 flex justify-end">
                      <a href={`/admin/permohonan/${sub.id}`} className="text-xs font-medium text-[#1a2e6f] hover:underline">
                        Lihat Detail Permohonan &rarr;
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
