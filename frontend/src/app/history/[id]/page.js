"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Loader2,
  ChevronRight,
  History,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStoredUser, apiFetch } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: "Menunggu Diproses",
    description: "Pengajuan Anda sedang menunggu untuk ditinjau oleh petugas desa.",
    cls: "bg-amber-50 text-amber-600 border-amber-200",
    icon: Clock,
    step: 1,
  },
  ON_PROCESS: {
    label: "Sedang Diproses",
    description: "Petugas desa sedang memproses pengajuan Anda.",
    cls: "bg-blue-50 text-blue-600 border-blue-200",
    icon: RefreshCw,
    step: 2,
  },
  APPROVED: {
    label: "Disetujui",
    description: "Pengajuan Anda telah disetujui oleh petugas desa.",
    cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: CheckCircle2,
    step: 3,
  },
  REJECTED: {
    label: "Ditolak",
    description: "Pengajuan Anda tidak dapat disetujui. Silakan hubungi kantor desa untuk informasi lebih lanjut.",
    cls: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
    step: -1,
  },
  COMPLETED: {
    label: "Selesai",
    description: "Surat Anda telah selesai diproses dan siap untuk diunduh.",
    cls: "bg-violet-50 text-violet-600 border-violet-200",
    icon: FileCheck,
    step: 4,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border ${cfg.cls}`}>
      <Icon size={14} />
      {cfg.label}
    </span>
  );
}

// ─── Progress Steps ────────────────────────────────────────────────────────────
const STEPS = [
  { step: 1, label: "Dikirim", icon: FileText },
  { step: 2, label: "Diproses", icon: RefreshCw },
  { step: 3, label: "Disetujui", icon: CheckCircle2 },
  { step: 4, label: "Selesai", icon: FileCheck },
];

function ProgressTracker({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const isRejected = status === "REJECTED";
  const currentStep = cfg.step;

  if (isRejected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <XCircle size={20} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">Pengajuan Ditolak</p>
          <p className="text-xs text-red-500 mt-0.5">{cfg.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">
        Progres Pengajuan
      </p>
      <div className="flex items-center gap-0">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.step;
          const isActive = currentStep === s.step;
          const Icon = s.icon;
          return (
            <div key={s.step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-[#1a2e6f] text-white"
                      : isActive
                      ? "bg-[#1a2e6f]/10 text-[#1a2e6f] ring-2 ring-[#1a2e6f]/30"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                </div>
                <span
                  className={`text-[10px] font-medium whitespace-nowrap ${
                    isCompleted || isActive ? "text-[#1a2e6f]" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mb-5 mx-1 rounded-full transition-all ${
                    currentStep > s.step ? "bg-[#1a2e6f]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {cfg.description && (
        <p className="text-xs text-gray-500 mt-4 text-center">{cfg.description}</p>
      )}
    </div>
  );
}

// ─── Download Button ───────────────────────────────────────────────────────────
function DownloadButton({ submissionId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/submissions/${submissionId}/download`);
      const json = await res.json();
      if (json.success && json.data?.url) {
        window.open(json.data.url, "_blank");
      } else {
        setError(json.message || "Surat belum tersedia untuk diunduh");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <p className="text-xs text-red-500 mb-2 text-center">{error}</p>
      )}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-xl transition shadow-sm disabled:opacity-60 active:scale-[0.98]"
      >
        {loading ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <Download size={17} />
        )}
        {loading ? "Memproses..." : "Unduh Surat"}
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HistoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await apiFetch(`/api/submissions/${id}`);
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.message || "Gagal memuat detail pengajuan");
        }
        const json = await res.json();
        setSubmission(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, router]);

  const isCompleted = submission?.status === "COMPLETED";
  const hasGeneratedLetter = submission?.generatedLetters?.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
      <Navbar />

      <main className="flex-1 max-w-[860px] mx-auto w-full px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#1a2e6f] transition">
            Beranda
          </Link>
          <ChevronRight size={12} />
          <Link href="/history" className="hover:text-[#1a2e6f] transition">
            Riwayat Pengajuan
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Detail</span>
        </div>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2e6f] transition mb-6"
        >
          <ArrowLeft size={16} />
          Kembali ke Riwayat
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <Loader2 size={32} className="animate-spin text-[#1a2e6f]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-24 text-center">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Link
              href="/history"
              className="px-5 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-xl hover:bg-[#1a2e6f]/5 transition"
            >
              Kembali ke Riwayat
            </Link>
          </div>
        )}

        {/* Content */}
        {!loading && !error && submission && (
          <div className="flex flex-col gap-5">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1a2e6f]/10 flex items-center justify-center flex-shrink-0">
                    <History size={22} className="text-[#1a2e6f]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {submission.letterType?.name ?? "Detail Pengajuan"}
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Diajukan pada {formatDate(submission.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={submission.status} />
              </div>

              {/* Submission Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jenis Surat</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {submission.letterType?.name ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tanggal Pengajuan</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(submission.createdAt)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-400 mb-1.5">Keperluan / Tujuan</p>
                  <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-xl p-4 leading-relaxed">
                    {submission.purpose}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Terakhir Diperbarui</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(submission.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <ProgressTracker status={submission.status} />

            {/* Download Section — only show if COMPLETED and has letter */}
            {isCompleted && hasGeneratedLetter && (
              <div className="bg-white rounded-2xl border border-[#1a2e6f]/20 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <FileCheck size={20} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      Surat Siap Diunduh
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pengajuan Anda telah selesai. Klik tombol di bawah untuk mengunduh surat.
                    </p>
                  </div>
                </div>
                <DownloadButton submissionId={submission.id} />
              </div>
            )}

            {/* Info if COMPLETED but no letter yet */}
            {isCompleted && !hasGeneratedLetter && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
                <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  Status pengajuan sudah selesai namun surat belum diunggah. Silakan hubungi kantor desa.
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="flex justify-center pt-2">
              <Link
                href="/submission"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1a2e6f] transition"
              >
                Ajukan surat baru
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
