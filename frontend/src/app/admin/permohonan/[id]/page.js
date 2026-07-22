"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

function formatDate(iso) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Menunggu" },
  { value: "ON_PROCESS", label: "Sedang Diproses" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "COMPLETED", label: "Selesai" },
];

const STATUS_BADGE = {
  PENDING: { label: "Menunggu", cls: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock },
  ON_PROCESS: { label: "Sedang Diproses", cls: "bg-blue-50 text-blue-600 border-blue-200", icon: Clock },
  APPROVED: { label: "Disetujui", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
  COMPLETED: { label: "Selesai", cls: "bg-violet-50 text-violet-600 border-violet-200", icon: CheckCircle2 },
};

export default function DetailPermohonanPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status update
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ type: "", text: "" });

  // Download states
  const [downloadingDoc, setDownloadingDoc] = useState(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/api/admin/submissions/${id}`);
        const json = await res.json();
        if (json.success) {
          setSubmission(json.data);
          setNewStatus(json.data.status);
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

  const handleDownloadDoc = async (docId, docType) => {
    setDownloadingDoc(docId);
    try {
      const res = await apiFetch(`/api/admin/submissions/${id}/documents/${docId}/download`);
      const json = await res.json();
      if (json.success) {
        window.open(json.data.url, "_blank");
      } else {
        alert(json.message || "Gagal mendapatkan link unduhan");
      }
    } catch {
      alert("Gagal terhubung ke server");
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const res = await apiFetch(`/api/admin/letter-types/${submission.letterType.id}/template/download`);
      const json = await res.json();
      if (json.success) {
        window.open(json.data.url, "_blank");
      } else {
        alert(json.message || "Template tidak tersedia");
      }
    } catch {
      alert("Gagal terhubung ke server");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleSaveStatus = async () => {
    setSaving(true);
    setSaveMsg({ type: "", text: "" });
    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      if (adminNote) formData.append("adminNote", adminNote);
      if (uploadedFile) formData.append("generatedLetter", uploadedFile);

      const res = await apiFetch(`/api/admin/submissions/${id}/status`, {
        method: "PATCH",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setSaveMsg({ type: "success", text: "Status berhasil diperbarui dan notifikasi dikirim ke pengguna." });
        setSubmission((prev) => ({ ...prev, status: newStatus }));
        setUploadedFile(null);
      } else {
        setSaveMsg({ type: "error", text: json.message || "Gagal memperbarui status" });
      }
    } catch {
      setSaveMsg({ type: "error", text: "Gagal terhubung ke server" });
    } finally {
      setSaving(false);
    }
  };

  const docType = (type) => {
    if (type === "KARTU_KELUARGA") return "KK";
    if (type === "KTP") return "KTP";
    return type;
  };

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

  const statusCfg = STATUS_BADGE[submission.status] ?? STATUS_BADGE.PENDING;
  const StatusIcon = statusCfg.icon;

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

      {/* Registration Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Nomor Pendaftaran</p>
            <h1 className="text-lg font-bold text-gray-900 font-mono">
              PKK-{submission.id.replace(/-/g, "").slice(0, 16).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tanggal Daftar : {formatDate(submission.createdAt)}
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full border ${statusCfg.cls}`}>
            <StatusIcon size={14} />
            {statusCfg.label}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
          <FileText size={15} className="text-[#1a2e6f] flex-shrink-0" />
          <span className="text-sm text-gray-600">
            <span className="font-medium">Jenis Surat:</span> {submission.letterType?.name}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">
            <span className="font-medium">Keperluan:</span> {submission.purpose}
          </span>
        </div>
      </div>

      {/* Data Pemohon */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#1a2e6f]/10 flex items-center justify-center">
            <User size={15} className="text-[#1a2e6f]" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Data Pemohon</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: "Nama Pemohon", value: submission.user?.name },
            { label: "Email", value: submission.user?.email },
            { label: "NIK", value: submission.user?.nik ?? "-" },
            { label: "No. KK", value: submission.user?.familyCardNumber ?? "-" },
            { label: "Nomor Telepon", value: submission.user?.phoneNumber },
            { label: "Alamat", value: submission.user?.address },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs text-gray-400 mb-0.5">{field.label}</p>
              <p className="text-sm font-medium text-gray-800">{field.value ?? "-"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dokumen Permohonan */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#1a2e6f]/10 flex items-center justify-center">
            <FileText size={15} className="text-[#1a2e6f]" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Dokumen Permohonan</h2>
        </div>

        <div className="flex flex-col gap-3">
          {submission.documents?.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-red-400" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {docType(doc.documentType)}.jpg
                </span>
              </div>
              <button
                onClick={() => handleDownloadDoc(doc.id, doc.documentType)}
                disabled={downloadingDoc === doc.id}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#1a2e6f] border border-[#1a2e6f]/30 rounded-lg hover:bg-[#1a2e6f]/5 transition disabled:opacity-60"
              >
                {downloadingDoc === doc.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Download size={12} />
                )}
                Unduh
              </button>
            </div>
          ))}

          {/* Template Download */}
          {submission.letterType?.templatePath && (
            <div className="flex items-center justify-between bg-blue-50 rounded-xl border border-blue-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{submission.letterType.templatePath}</p>
                  <p className="text-xs text-blue-500">Template Surat</p>
                </div>
              </div>
              <button
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-100 transition disabled:opacity-60"
              >
                {downloadingTemplate ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Download size={12} />
                )}
                Unduh Template
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Perbarui Status Permohonan</h2>

        {saveMsg.text && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${
              saveMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {saveMsg.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
            {saveMsg.text}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Status Select */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Admin Note */}
          {newStatus === "REJECTED" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Catatan Penolakan <span className="text-gray-400">(opsional)</span>
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Alasan penolakan..."
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
              />
            </div>
          )}

          {/* Upload Surat Diproses */}
          {(newStatus === "APPROVED" || newStatus === "COMPLETED") && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Upload Surat Selesai <span className="text-gray-400">(opsional — dapat diunduh pengguna)</span>
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#1a2e6f] hover:bg-[#1a2e6f]/5 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText size={16} className="text-[#1a2e6f]" />
                    <span className="text-sm font-medium text-gray-700">{uploadedFile.name}</span>
                    <span className="text-xs text-gray-400">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Klik untuk upload surat (.docx, .pdf)</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".docx,.pdf,.doc"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveStatus}
              disabled={saving}
              id="admin-save-status"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-xl transition disabled:opacity-60 shadow-sm"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
