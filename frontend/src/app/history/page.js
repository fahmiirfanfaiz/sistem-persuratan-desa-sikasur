"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  History,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  PlusCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStoredUser, apiFetch } from "@/lib/api";

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    PENDING: {
      label: "Menunggu",
      icon: Clock,
      className: "bg-amber-50 text-amber-600 border-amber-200",
    },
    PROCESSING: {
      label: "Diproses",
      icon: AlertCircle,
      className: "bg-blue-50 text-blue-600 border-blue-200",
    },
    ON_PROCESS: {
      label: "Diproses",
      icon: AlertCircle,
      className: "bg-blue-50 text-blue-600 border-blue-200",
    },
    APPROVED: {
      label: "Disetujui",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    REJECTED: {
      label: "Ditolak",
      icon: XCircle,
      className: "bg-red-50 text-red-600 border-red-200",
    },
    COMPLETED: {
      label: "Selesai",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
  };

  const cfg = config[status] ?? config.PENDING;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.className}`}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

// ─── Format Date ───────────────────────────────────────────────────────────────
function formatDate(isoString) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

// ─── Submission Card ───────────────────────────────────────────────────────────
function SubmissionCard({ submission }) {
  return (
    <Link
      href={`/history/${submission.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1a2e6f]/20 transition-all duration-200 p-4 sm:p-5 group cursor-pointer"
    >
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Icon + Info */}
        <div className="flex items-center sm:items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#1a2e6f]/10 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-[#1a2e6f]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {submission.letterType?.name ?? "Surat Keterangan"}
            </p>
            <p className="hidden sm:block text-xs text-gray-400 mt-0.5 line-clamp-1">
              Keperluan: {submission.purpose}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock size={11} />
              {formatDate(submission.createdAt)}
            </p>
          </div>
        </div>

        {/* Status + Chevron */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <StatusBadge status={submission.status} />
          <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1a2e6f] transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-[#1a2e6f]/10 flex items-center justify-center mb-5">
        <History size={36} className="text-[#1a2e6f]/50" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-2">
        Belum ada pengajuan
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        Anda belum pernah mengajukan surat. Mulai pengajuan sekarang!
      </p>
      <Link
        href="/submission"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] rounded-xl hover:bg-[#152460] transition shadow-sm"
      >
        <PlusCircle size={16} />
        Ajukan Surat
      </Link>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await apiFetch("/api/submissions");
      if (!res.ok) throw new Error("Gagal memuat data riwayat");
      const json = await res.json();
      setSubmissions(json.data ?? []);
    } catch (err) {
      if (!isManualRefresh) setError(err.message);
    } finally {
      if (isManualRefresh) setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }

    fetchSubmissions();

    // 1. Polling every 30s
    const interval = setInterval(() => fetchSubmissions(), 30000);

    // 2. Fetch on visibility change (user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchSubmissions();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router, fetchSubmissions]);

  const counts = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "PENDING").length,
    approved: submissions.filter((s) => s.status === "APPROVED" || s.status === "COMPLETED").length,
    rejected: submissions.filter((s) => s.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-400">
              <Link href="/" className="hover:text-[#1a2e6f] transition">Beranda</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600">Riwayat Pengajuan</span>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-500 hover:text-[#1a2e6f] transition"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Kembali ke Beranda</span>
              <span className="sm:hidden">Kembali</span>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <History size={24} className="text-[#1a2e6f] hidden sm:block" />
                Riwayat Pengajuan Surat
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Pantau status seluruh pengajuan surat Anda
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => fetchSubmissions(true)}
                disabled={refreshing || loading}
                className="flex items-center justify-center p-2.5 sm:px-4 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
                title="Refresh Status"
              >
                <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline sm:ml-2">Refresh</span>
              </button>
              
              <Link
                href="/submission"
                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] rounded-xl hover:bg-[#152460] transition shadow-sm"
              >
                <PlusCircle size={16} />
                Ajukan Baru
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && !error && submissions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              { label: "Total", value: counts.total, color: "text-[#1a2e6f]", bg: "bg-[#1a2e6f]/10" },
              { label: "Menunggu", value: counts.pending, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Disetujui/Selesai", value: counts.approved, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Ditolak", value: counts.rejected, color: "text-red-500", bg: "bg-red-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-gray-500 mb-1 leading-tight">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 size={32} className="animate-spin text-[#1a2e6f]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-xl hover:bg-[#1a2e6f]/5 transition"
            >
              Coba Lagi
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

