"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  User,
  FileText,
  Clock,
  Loader2,
  AlertCircle,
  Download,
  Pencil,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileCheck,
} from "lucide-react";

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

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu", cls: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock },
  ON_PROCESS: { label: "Diproses", cls: "bg-blue-50 text-blue-600 border-blue-200", icon: RefreshCw },
  APPROVED: { label: "Disetujui", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
  COMPLETED: { label: "Selesai", cls: "bg-violet-50 text-violet-600 border-violet-200", icon: FileCheck },
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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-words">{value || "-"}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-[#1a2e6f]/10 flex items-center justify-center">
          <Icon size={16} className="text-[#1a2e6f]" />
        </div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function DocumentRow({ submissionId, doc }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const LABEL = { KARTU_KELUARGA: "Kartu Keluarga (KK)", KTP: "KTP" };

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/admin/submissions/${submissionId}/documents/${doc.id}/download`);
      const json = await res.json();
      if (json.success && json.data?.url) {
        window.open(json.data.url, "_blank");
      } else {
        setError(json.message || "Gagal mendapatkan link unduhan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
          <FileText size={16} className="text-[#1a2e6f]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{LABEL[doc.documentType] ?? doc.documentType}</p>
          <p className="text-xs text-gray-400">{formatDate(doc.createdAt)}</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1a2e6f] bg-white border border-[#1a2e6f]/30 rounded-lg hover:bg-[#1a2e6f]/5 transition disabled:opacity-60"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          Unduh
        </button>
      </div>
    </div>
  );
}

function GeneratedLetterRow({ submissionId, letter }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      // Use the generated letter path via admin template download
      const res = await apiFetch(`/api/admin/submissions/${submissionId}/template/download`);
      const json = await res.json();
      if (json.success && json.data?.url) {
        window.open(json.data.url, "_blank");
      } else {
        setError("Gagal mendapatkan link unduhan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl gap-3 border border-violet-100">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-white border border-violet-200 flex items-center justify-center flex-shrink-0 shadow-sm">
          <FileCheck size={16} className="text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Surat yang Diterbitkan</p>
          <p className="text-xs text-gray-400">
            {formatDate(letter.createdAt)} ·{" "}
            <span className={`font-medium ${letter.status === "ISSUED" ? "text-violet-600" : "text-amber-600"}`}>
              {letter.status === "ISSUED" ? "Diterbitkan" : "Draft"}
            </span>
          </p>
          {letter.letterNumber && (
            <p className="text-xs text-gray-500 mt-0.5">No: {letter.letterNumber}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-violet-600 bg-white border border-violet-300 rounded-lg hover:bg-violet-50 transition disabled:opacity-60"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          Unduh
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DetailPermohonanPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/admin/submissions/${id}`);
      const json = await res.json();
      if (json.success) {
        setSubmission(json.data);
      } else {
        setError(json.message || "Gagal memuat data");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, fetchDetail]);

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
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-4 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-lg hover:bg-[#1a2e6f]/5 transition"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2e6f] transition mb-3"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detail Permohonan</h1>
          <p className="text-sm text-gray-500 mt-1">
            ID:{" "}
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
              {submission.id}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={submission.status} />
          <Link
            href={`/admin/permohonan/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-xl transition shadow-sm"
          >
            <Pencil size={15} />
            Edit Status
          </Link>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — 2/3 */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Submission Info */}
          <SectionCard title="Informasi Pengajuan" icon={FileText}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={FileText} label="Jenis Surat" value={submission.letterType?.name} />
              <InfoRow icon={Clock} label="Tanggal Pengajuan" value={formatDate(submission.createdAt)} />
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 mb-1.5">Keperluan / Tujuan</p>
                <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-xl p-4 leading-relaxed">
                  {submission.purpose}
                </p>
              </div>
              <InfoRow icon={Clock} label="Terakhir Diperbarui" value={formatDate(submission.updatedAt)} />
            </div>
          </SectionCard>

          {/* Documents */}
          <SectionCard title="Dokumen Persyaratan" icon={FileText}>
            {submission.documents?.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Tidak ada dokumen.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {submission.documents?.map((doc) => (
                  <DocumentRow key={doc.id} submissionId={submission.id} doc={doc} />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Generated Letters */}
          <SectionCard title="Surat yang Diterbitkan" icon={FileCheck}>
            {submission.generatedLetters?.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <FileCheck size={22} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Belum ada surat yang diterbitkan.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Surat akan tersedia setelah status diubah ke &quot;Selesai&quot; dan file diunggah.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {submission.generatedLetters?.map((letter) => (
                  <GeneratedLetterRow key={letter.id} submissionId={submission.id} letter={letter} />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right — 1/3 */}
        <div className="flex flex-col gap-5">
          <SectionCard title="Data Pemohon" icon={User}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#1a2e6f] text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
                  {submission.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{submission.user?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Pemohon</p>
                </div>
              </div>
              <InfoRow icon={CreditCard} label="NIK" value={submission.user?.nik} />
              <InfoRow icon={CreditCard} label="No. Kartu Keluarga" value={submission.user?.familyCardNumber} />
              <InfoRow icon={Phone} label="No. Telepon" value={submission.user?.phoneNumber} />
              <InfoRow icon={Mail} label="Email" value={submission.user?.email} />
              <InfoRow icon={MapPin} label="Alamat" value={submission.user?.address} />
            </div>
          </SectionCard>

          <div className="bg-[#1a2e6f] rounded-2xl p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3 opacity-70">
              Tindakan Cepat
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/permohonan/${id}/edit`}
                className="flex items-center gap-2.5 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition"
              >
                <Pencil size={15} />
                Ubah Status Permohonan
              </Link>
              <button
                onClick={fetchDetail}
                className="flex items-center gap-2.5 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition"
              >
                <RefreshCw size={15} />
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
