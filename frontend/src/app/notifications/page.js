"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  RotateCcw,
  CheckCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStoredUser, apiFetch } from "@/lib/api";

// ─── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "spd_read_notifs";

function getReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

// ─── Notification config per status ───────────────────────────────────────────
function getNotifConfig(status) {
  const map = {
    PENDING: {
      icon: Clock,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-50",
      title: "Pengajuan Sedang Menunggu",
      desc: (name) => `Pengajuan surat "${name}" Anda sedang dalam antrian dan menunggu untuk diproses.`,
    },
    PROCESSING: {
      icon: AlertCircle,
      iconClass: "text-blue-500",
      bgClass: "bg-blue-50",
      title: "Pengajuan Sedang Diproses",
      desc: (name) => `Pengajuan surat "${name}" Anda sedang diproses oleh petugas.`,
    },
    APPROVED: {
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-50",
      title: "Pengajuan Disetujui",
      desc: (name) => `Selamat! Pengajuan surat "${name}" Anda telah disetujui.`,
    },
    REJECTED: {
      icon: XCircle,
      iconClass: "text-red-500",
      bgClass: "bg-red-50",
      title: "Pengajuan Ditolak",
      desc: (name) => `Pengajuan surat "${name}" Anda tidak dapat disetujui. Silakan ajukan ulang.`,
    },
  };
  return map[status] ?? map.PENDING;
}

// ─── Relative time ─────────────────────────────────────────────────────────────
function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoString));
}

// ─── Notification Card ─────────────────────────────────────────────────────────
function NotifCard({ notif, isRead, onRead }) {
  const cfg = getNotifConfig(notif.status);
  const Icon = cfg.icon;

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 p-5 cursor-pointer group ${
        isRead
          ? "border-gray-100 shadow-sm"
          : "border-[#1a2e6f]/20 shadow-md ring-1 ring-[#1a2e6f]/10"
      }`}
      onClick={() => onRead(notif.id)}
    >
      {/* Unread dot */}
      {!isRead && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#1a2e6f]" />
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl ${cfg.bgClass} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={cfg.iconClass} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm font-semibold ${isRead ? "text-gray-700" : "text-gray-900"}`}>
              {cfg.title}
            </p>
            <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">
              {relativeTime(notif.updatedAt ?? notif.createdAt)}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {cfg.desc(notif.letterType?.name ?? "Surat Keterangan")}
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Keperluan: <span className="text-gray-500">{notif.purpose}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-[#1a2e6f]/10 flex items-center justify-center mb-5">
        <Bell size={36} className="text-[#1a2e6f]/40" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-2">Tidak ada notifikasi</h3>
      <p className="text-sm text-gray-400 max-w-xs">
        Semua notifikasi pengajuan surat Anda akan muncul di sini.
      </p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setReadIds(getReadIds());

    const fetchData = async () => {
      try {
        const res = await apiFetch("/api/submissions");
        if (!res.ok) throw new Error("Gagal memuat notifikasi");
        const json = await res.json();
        setSubmissions(json.data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleRead = useCallback((id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const handleMarkAllRead = () => {
    const all = new Set(submissions.map((s) => s.id));
    setReadIds(all);
    saveReadIds(all);
  };

  const unreadCount = submissions.filter((s) => !readIds.has(s.id)).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto w-full px-6 py-10">
        {/* Breadcrumb + Back button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#1a2e6f] transition">Beranda</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Notifikasi</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#1a2e6f] transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell size={24} className="text-[#1a2e6f]" />
              Notifikasi
              {unreadCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-bold text-white bg-[#1a2e6f] rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Status terbaru pengajuan surat Anda
            </p>
          </div>

          {!loading && submissions.length > 0 && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1a2e6f] border border-[#1a2e6f]/30 rounded-xl hover:bg-[#1a2e6f]/5 transition"
            >
              <CheckCheck size={14} />
              Tandai semua dibaca
            </button>
          )}
        </div>

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
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-xl hover:bg-[#1a2e6f]/5 transition"
            >
              <RotateCcw size={14} />
              Coba Lagi
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {/* Unread section */}
            {unreadCount > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                  Belum Dibaca
                </p>
                {submissions
                  .filter((s) => !readIds.has(s.id))
                  .map((s) => (
                    <NotifCard
                      key={s.id}
                      notif={s}
                      isRead={false}
                      onRead={handleRead}
                    />
                  ))}
              </>
            )}

            {/* Read section */}
            {submissions.some((s) => readIds.has(s.id)) && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mt-2">
                  Sudah Dibaca
                </p>
                {submissions
                  .filter((s) => readIds.has(s.id))
                  .map((s) => (
                    <NotifCard
                      key={s.id}
                      notif={s}
                      isRead={true}
                      onRead={handleRead}
                    />
                  ))}
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
