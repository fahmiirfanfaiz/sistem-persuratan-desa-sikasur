'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  ArrowLeft,
  User,
  FileText,
  Clock,
  Loader2,
  AlertCircle,
  Download,
  Eye,
  X,
  Pencil,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileCheck,
  FileImage,
} from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

const STATUS_CONFIG = {
  PENDING: { label: 'Menunggu', cls: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock },
  ON_PROCESS: { label: 'Diproses', cls: 'bg-blue-50 text-blue-600 border-blue-200', icon: RefreshCw },
  APPROVED: { label: 'Disetujui', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
  REJECTED: { label: 'Ditolak', cls: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
  COMPLETED: { label: 'Selesai', cls: 'bg-violet-50 text-violet-600 border-violet-200', icon: FileCheck },
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
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 wrap-break-word">{value || '-'}</p>
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

function PreviewModal({ isOpen, onClose, url, title, isPdf, onDownload, downloading }) {
  if (!isOpen) return null;

  // Handle .docx fallback (since S3 url might have it in the path)
  const isDocx = url?.toLowerCase().includes('.docx') || url?.toLowerCase().includes('.doc');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {isPdf ? <FileText size={16} className="text-[#1a2e6f]" /> : <FileImage size={16} className="text-[#1a2e6f]" />}
            <p className="text-sm font-semibold text-gray-800">{title}</p>
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
            <iframe src={url} title={title} className="w-full h-full min-h-125" style={{ border: 'none', height: '70vh' }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={title} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Tutup
          </button>
          {onDownload ? (
            <button
              onClick={onDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-lg transition disabled:opacity-60"
            >
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Unduh Surat
            </button>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-lg transition"
            >
              <Download size={13} />
              Buka di Tab Baru
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentRow({ submissionId, doc }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const LABEL = { KARTU_KELUARGA: 'Kartu Keluarga (KK)', KTP: 'KTP' };

  const handlePreview = async () => {
    if (previewUrl) { setShowPreview(true); return; }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/admin/submissions/${submissionId}/documents/${doc.id}/download`);
      const json = await res.json();
      if (json.success && json.data?.url) {
        setPreviewUrl(json.data.url);
        setShowPreview(true);
      } else {
        setError(json.message || 'Gagal mendapatkan dokumen');
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const isPdf = doc.storagePath?.toLowerCase().endsWith('.pdf');

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
            {isPdf ? <FileText size={16} className="text-red-500" /> : <FileImage size={16} className="text-[#1a2e6f]" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{LABEL[doc.documentType] ?? doc.documentType}</p>
            <p className="text-xs text-gray-400">{formatDate(doc.createdAt)}</p>
          </div>
        </div>
        <div className="shrink-0">
          {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
          <button
            onClick={handlePreview}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1a2e6f] bg-white border border-[#1a2e6f]/30 rounded-lg hover:bg-[#1a2e6f]/5 transition disabled:opacity-60"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
            Lihat
          </button>
        </div>
      </div>
      {showPreview && previewUrl && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          url={previewUrl}
          title={LABEL[doc.documentType] ?? doc.documentType}
          isPdf={isPdf}
        />
      )}
    </>
  );
}

function GeneratedLetterRow({ submissionId, letter }) {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchUrl = async (asAttachment = false) => {
    setError('');
    try {
      const res = await apiFetch(
        `/api/admin/submissions/${submissionId}/generated-letters/${letter.id}/download?attachment=${asAttachment}`
      );
      const json = await res.json();
      if (json.success && json.data?.url) {
        return json.data;
      } else {
        setError(json.message || 'Gagal mendapatkan link surat');
        return null;
      }
    } catch {
      setError('Gagal terhubung ke server');
      return null;
    }
  };

  const handlePreview = async () => {
    if (previewUrl) {
      setShowPreview(true);
      return;
    }
    setPreviewLoading(true);
    const data = await fetchUrl(false);
    setPreviewLoading(false);
    if (data?.url) {
      setPreviewUrl(data.url);
      setShowPreview(true);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    const data = await fetchUrl(true);
    setDownloadLoading(false);
    if (data?.url) {
      const a = document.createElement('a');
      a.href = data.url;
      if (data.filename) a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const isPdf = letter.path?.toLowerCase().endsWith('.pdf');

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl gap-3 border border-violet-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white border border-violet-200 flex items-center justify-center shrink-0 shadow-sm">
            <FileCheck size={16} className="text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Surat yang Diterbitkan</p>
            <p className="text-xs text-gray-400">
              {formatDate(letter.createdAt)} ·{' '}
              <span className={`font-medium ${letter.status === 'ISSUED' ? 'text-violet-600' : 'text-amber-600'}`}>
                {letter.status === 'ISSUED' ? 'Diterbitkan' : 'Draft'}
              </span>
            </p>
            {letter.letterNumber && <p className="text-xs text-gray-500 mt-0.5">No: {letter.letterNumber}</p>}
          </div>
        </div>
        <div className="shrink-0">
          {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              disabled={previewLoading || downloadLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-600 bg-white border border-violet-300 rounded-lg hover:bg-violet-50 transition disabled:opacity-60"
            >
              {previewLoading ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
              Lihat
            </button>
            <button
              onClick={handleDownload}
              disabled={previewLoading || downloadLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-600 bg-white border border-violet-300 rounded-lg hover:bg-violet-50 transition disabled:opacity-60"
            >
              {downloadLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              Unduh
            </button>
          </div>
        </div>
      </div>
      {showPreview && previewUrl && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          url={previewUrl}
          title="Surat yang Diterbitkan"
          isPdf={isPdf}
          onDownload={handleDownload}
          downloading={downloadLoading}
        />
      )}
    </>
  );
}

export default function DetailPermohonanPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/admin/submissions/${id}`);
      const json = await res.json();
      if (json.success) {
        setSubmission(json.data);
      } else {
        setError(json.message || 'Gagal memuat data');
      }
    } catch {
      setError('Gagal terhubung ke server');
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
        <button onClick={() => router.back()} className="mt-2 px-4 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-lg hover:bg-[#1a2e6f]/5 transition">
          Kembali
        </button>
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2e6f] transition mb-3">
            <ArrowLeft size={16} />
            Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detail Permohonan</h1>
          <p className="text-sm text-gray-500 mt-1">
            ID: <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{submission.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <SectionCard title="Informasi Pengajuan" icon={FileText}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={FileText} label="Jenis Surat" value={submission.letterType?.name} />
              <InfoRow icon={Clock} label="Tanggal Pengajuan" value={formatDate(submission.createdAt)} />
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 mb-1.5">Keperluan / Tujuan</p>
                <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-xl p-4 leading-relaxed">{submission.purpose}</p>
              </div>
              <InfoRow icon={Clock} label="Terakhir Diperbarui" value={formatDate(submission.updatedAt)} />
            </div>
          </SectionCard>

          <SectionCard title="Dokumen Persyaratan" icon={FileText}>
            <p className="text-xs text-gray-400 mb-3">
              Klik <span className="font-semibold">Lihat</span> untuk melihat dokumen KTP/KK. Dokumen hanya dapat dilihat, tidak dapat diunduh.
            </p>
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

          <SectionCard title="Surat yang Diterbitkan" icon={FileCheck}>
            {submission.generatedLetters?.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <FileCheck size={22} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Belum ada surat yang diterbitkan.</p>
                <p className="text-xs text-gray-400 mt-1">Surat akan tersedia setelah status diubah ke &quot;Selesai&quot; dan file diunggah.</p>
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

        <div className="flex flex-col gap-5">
          <SectionCard title="Data Pemohon" icon={User}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#1a2e6f] text-white text-lg font-bold flex items-center justify-center shrink-0">
                  {submission.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
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
            <p className="text-xs font-semibold uppercase tracking-wide mb-3 opacity-70">Tindakan Cepat</p>
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