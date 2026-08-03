'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  X,
  Loader2,
  ChevronRight,
  History,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getStoredUser, apiFetch } from '@/lib/api';

function formatDate(iso) {
  if (!iso) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Menunggu Diproses',
    description: 'Pengajuan Anda sedang menunggu untuk ditinjau oleh petugas desa.',
    cls: 'bg-amber-50 text-amber-600 border-amber-200',
    icon: Clock,
    step: 1,
  },
  ON_PROCESS: {
    label: 'Sedang Diproses',
    description: 'Petugas desa sedang memproses pengajuan Anda.',
    cls: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: RefreshCw,
    step: 2,
  },
  APPROVED: {
    label: 'Disetujui',
    description: 'Pengajuan Anda telah disetujui oleh petugas desa.',
    cls: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    icon: CheckCircle2,
    step: 3,
  },
  REJECTED: {
    label: 'Ditolak',
    description: 'Pengajuan Anda tidak dapat disetujui. Silakan hubungi kantor desa untuk informasi lebih lanjut.',
    cls: 'bg-red-50 text-red-600 border-red-200',
    icon: XCircle,
    step: -1,
  },
  COMPLETED: {
    label: 'Selesai',
    description: 'Surat Anda telah selesai diproses dan siap untuk diunduh.',
    cls: 'bg-violet-50 text-violet-600 border-violet-200',
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

const STEPS = [
  { step: 1, label: 'Dikirim', icon: FileText },
  { step: 2, label: 'Diproses', icon: RefreshCw },
  { step: 3, label: 'Disetujui', icon: CheckCircle2 },
  { step: 4, label: 'Selesai', icon: FileCheck },
];

function ProgressTracker({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const isRejected = status === 'REJECTED';
  const currentStep = cfg.step;

  if (isRejected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
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
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">Progres Pengajuan</p>
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
                    isCompleted ? 'bg-[#1a2e6f] text-white'
                    : isActive ? 'bg-[#1a2e6f]/10 text-[#1a2e6f] ring-2 ring-[#1a2e6f]/30'
                    : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${isCompleted || isActive ? 'text-[#1a2e6f]' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all ${currentStep > s.step ? 'bg-[#1a2e6f]' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      {cfg.description && <p className="text-xs text-gray-500 mt-4 text-center">{cfg.description}</p>}
    </div>
  );
}

function PreviewModal({ isOpen, onClose, url, isPdf }) {
  if (!isOpen) return null;

  // Handle .docx fallback (since S3 url might have it in the path)
  const isDocx = url?.toLowerCase().includes('.docx') || url?.toLowerCase().includes('.doc');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileCheck size={16} className="text-violet-600" />
            <p className="text-sm font-semibold text-gray-800">Surat yang Diterbitkan</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-gray-50 min-h-100 flex items-center justify-center">
          {isDocx ? (
            <div className="flex flex-col items-center p-8 text-center">
              <FileText size={48} className="text-gray-400 mb-4" />
              <p className="text-sm font-semibold text-gray-700">File Word tidak dapat dipratinjau secara langsung.</p>
              <p className="text-xs text-gray-500 mt-1">Silakan unduh file untuk melihatnya.</p>
            </div>
          ) : isPdf ? (
            <iframe src={url} title="Surat" className="w-full min-h-125" style={{ border: 'none', height: '70vh' }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Surat" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Tutup
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-lg transition"
          >
            <Download size={13} />
            Unduh / Buka di Tab Baru
          </a>
        </div>
      </div>
    </div>
  );
}

function LetterSection({ submissionId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchUrl = async () => {
    if (url) return url;
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/submissions/${submissionId}/download`);
      const json = await res.json();
      if (json.success && json.data?.url) {
        setUrl(json.data.url);
        return json.data.url;
      } else {
        setError(json.message || 'Surat belum tersedia untuk diunduh');
        return null;
      }
    } catch {
      setError('Gagal terhubung ke server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    const result = await fetchUrl();
    if (result) setShowPreview(true);
  };

  const handleDownload = async () => {
    const result = await fetchUrl();
    if (result) window.open(result, '_blank');
  };

  const isPdf = url?.toLowerCase().includes('.pdf') || false;

  return (
    <div className="bg-white rounded-2xl border border-[#1a2e6f]/20 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <FileCheck size={20} className="text-violet-600" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">Surat Siap Diunduh</p>
          <p className="text-xs text-gray-400 mt-0.5">Pengajuan Anda telah selesai. Lihat atau unduh surat di bawah.</p>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#1a2e6f] bg-[#1a2e6f]/10 hover:bg-[#1a2e6f]/20 border border-[#1a2e6f]/20 rounded-xl transition disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
          {loading ? 'Memuat...' : 'Lihat Surat'}
        </button>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-xl transition shadow-sm disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {loading ? 'Memuat...' : 'Unduh Surat'}
        </button>
      </div>

      {showPreview && url && (
        <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} url={url} isPdf={isPdf} />
      )}
    </div>
  );
}

export default function HistoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push('/login');
      return;
    }
    const fetchDetail = async () => {
      try {
        const res = await apiFetch(`/api/submissions/${id}`);
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.message || 'Gagal memuat detail pengajuan');
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

  const isCompleted = submission?.status === 'COMPLETED';
  const hasGeneratedLetter = submission?.generatedLetters?.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
      <Navbar />
      <main className="flex-1 max-w-215 mx-auto w-full px-6 py-10">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#1a2e6f] transition">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/history" className="hover:text-[#1a2e6f] transition">Riwayat Pengajuan</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Detail</span>
        </div>

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2e6f] transition mb-6">
          <ArrowLeft size={16} />
          Kembali ke Riwayat
        </button>

        {loading && (
          <div className="flex justify-center items-center py-32">
            <Loader2 size={32} className="animate-spin text-[#1a2e6f]" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-24 text-center">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Link href="/history" className="px-5 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-xl hover:bg-[#1a2e6f]/5 transition">
              Kembali ke Riwayat
            </Link>
          </div>
        )}

        {!loading && !error && submission && (
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1a2e6f]/10 flex items-center justify-center shrink-0">
                    <History size={22} className="text-[#1a2e6f]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{submission.letterType?.name ?? 'Detail Pengajuan'}</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Diajukan pada {formatDate(submission.createdAt)}</p>
                  </div>
                </div>
                <StatusBadge status={submission.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jenis Surat</p>
                  <p className="text-sm font-semibold text-gray-800">{submission.letterType?.name ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tanggal Pengajuan</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(submission.createdAt)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-400 mb-1.5">Keperluan / Tujuan</p>
                  <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-xl p-4 leading-relaxed">{submission.purpose}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Terakhir Diperbarui</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(submission.updatedAt)}</p>
                </div>
              </div>
            </div>

            <ProgressTracker status={submission.status} />

            {isCompleted && hasGeneratedLetter && <LetterSection submissionId={submission.id} />}

            {isCompleted && !hasGeneratedLetter && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700">Status pengajuan sudah selesai namun surat belum diunggah. Silakan hubungi kantor desa.</p>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <Link href="/submission" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1a2e6f] transition">
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