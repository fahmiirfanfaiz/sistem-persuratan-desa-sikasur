"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Upload,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SubmissionConfirmModal from "@/components/SubmissionConfirmModal";
import { getStoredUser, apiFetch } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── File Upload Zone ──────────────────────────────────────────────────────────
function FileUploadZone({ label, file, onFileChange, onRemove, id }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {file ? (
        /* Preview */
        <div className="relative border border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 flex items-center gap-3">
          {/* Thumbnail */}
          {file.type.startsWith("image/") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-14 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
            aria-label="Hapus file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* Drop Zone */
        <div
          role="button"
          tabIndex={0}
          aria-label={`Unggah ${label}`}
          className={`border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 py-8 px-4 ${
            dragging
              ? "border-[#1a2e6f] bg-[#1a2e6f]/5"
              : "border-gray-300 hover:border-[#1a2e6f] hover:bg-gray-50"
          }`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload size={24} className="text-gray-400" strokeWidth={1.5} />
          <p className="text-sm text-gray-500 text-center">
            Klik Untuk Mengunggah Atau Seret Dan Lepas
          </p>
          <p className="text-xs text-gray-400">
            Format: Image (Maksimal 10 MB)
          </p>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileChange(f);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Custom Dropdown ──────────────────────────────────────────────────────────
function CustomSelect({ id, value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between h-[46px] px-4 rounded-lg border text-sm transition
          ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : "bg-white cursor-pointer"}
          ${open ? "border-[#1a2e6f] ring-2 ring-[#1a2e6f]/20" : "border-gray-300"}
          text-left`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && options.length > 0 && (
        <div
          role="listbox"
          className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-4 py-3 text-sm cursor-pointer transition
                ${opt.value === value
                  ? "bg-[#eef1fb] text-[#1a2e6f] font-medium"
                  : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubmissionPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Categories / letter types from API
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    namaLengkap: "",
    nik: "",
    nomorKK: "",
    nomorWhatsapp: "",
    alamat: "",
    categoryId: "",
    letterTypeId: "",
    keperluan: "",
  });

  const [kkFile, setKkFile] = useState(null);
  const [ktpFile, setKtpFile] = useState(null);
  const [formError, setFormError] = useState("");

  // Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = getStoredUser();
    const token = localStorage.getItem("accessToken");
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }
    setUser(storedUser);
    // Pre-fill from stored user profile
    setFormData((prev) => ({
      ...prev,
      namaLengkap: storedUser.name || "",
    }));
    setIsAuthChecked(true);
  }, [router]);

  // ── Fetch letter categories ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthChecked) return;
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/letters/categories`);
        const json = await res.json();
        if (json.success) {
          setCategories(json.data);
        }
      } catch {
        // Categories failed to load, user can still fill other fields
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [isAuthChecked]);

  // ── Derived options ───────────────────────────────────────────────────────
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const selectedCategory = categories.find(
    (c) => c.id === formData.categoryId
  );

  const letterTypeOptions = selectedCategory
    ? selectedCategory.letterTypes.map((lt) => ({
        value: lt.id,
        label: lt.name,
      }))
    : [];

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      categoryId,
      letterTypeId: "", // reset letter type when category changes
    }));
    if (formError) setFormError("");
  };

  const handleLetterTypeChange = (letterTypeId) => {
    setFormData((prev) => ({ ...prev, letterTypeId }));
    if (formError) setFormError("");
  };

  const handleFileValidation = (file, fieldName) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (!file.type.startsWith("image/")) {
      setFormError(
        `File ${fieldName} harus berformat gambar (JPEG/PNG/WEBP)`
      );
      return false;
    }
    if (file.size > MAX_SIZE) {
      setFormError(`File ${fieldName} tidak boleh lebih dari 10 MB`);
      return false;
    }
    setFormError("");
    return true;
  };

  const handleKkFileChange = (file) => {
    if (handleFileValidation(file, "Kartu Keluarga")) setKkFile(file);
  };
  const handleKtpFileChange = (file) => {
    if (handleFileValidation(file, "KTP")) setKtpFile(file);
  };

  // Client-side validation before opening confirm modal
  const validateForm = () => {
    if (!formData.namaLengkap.trim()) return "Nama lengkap wajib diisi";
    if (!formData.nik.trim()) return "NIK wajib diisi";
    if (!formData.nomorKK.trim()) return "Nomor KK wajib diisi";
    if (!formData.nomorWhatsapp.trim()) return "Nomor WhatsApp wajib diisi";
    if (!formData.alamat.trim()) return "Alamat wajib diisi";
    if (!formData.categoryId) return "Jenis surat wajib dipilih";
    if (!formData.letterTypeId) return "Surat wajib dipilih";
    if (!formData.keperluan.trim()) return "Keperluan wajib diisi";
    if (!kkFile) return "File Kartu Keluarga wajib diunggah";
    if (!ktpFile) return "File KTP wajib diunggah";
    return null;
  };

  const handleSubmitClick = () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("letterTypeId", formData.letterTypeId);
      body.append("purpose", formData.keperluan.trim());
      body.append("kkFile", kkFile);
      body.append("ktpFile", ktpFile);

      const res = await apiFetch("/api/submissions", {
        method: "POST",
        body,
      });

      const json = await res.json();

      if (!res.ok) {
        setConfirmOpen(false);
        setFormError(json.message || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      // Success — redirect to success page
      router.push(`/submission/success/${json.data.submissionId}`);
    } catch {
      setConfirmOpen(false);
      setFormError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading auth check ────────────────────────────────────────────────────
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4fb]">
        <Loader2 size={32} className="animate-spin text-[#1a2e6f]" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f0f4fb]">
      <Navbar />

      {/* Hero banner */}
      <section
        className="relative w-full py-10 flex items-center overflow-hidden"
        style={{ minHeight: 140 }}
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/background-1.svg')" }}
        />
        <div className="absolute inset-0 bg-[#0a0f2e]/65" />

        {/* Content */}
        <div className="relative z-10 max-w-[1140px] mx-auto px-6 w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3 transition"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Pengajuan Permohonan Surat
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            Lengkapi formulir berikut untuk mengajukan permohonan surat
          </p>
        </div>
      </section>

      {/* Form Card */}
      <main className="flex-1 py-10">
        <div className="max-w-[720px] mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-8">
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Data Permohonan Surat
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Silakan lengkapi data diri dan dokumen pendukung untuk mengajukan
                permohonan surat.
              </p>
            </div>

            {/* Info alert */}
            <div className="flex items-start gap-3 bg-[#e8f4fd] border border-[#b3d9f5] rounded-lg px-4 py-3 mb-8">
              <AlertCircle
                size={18}
                className="text-[#1a6fa8] mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-xs font-semibold text-[#1a6fa8]">
                  Perhatian
                </p>
                <p className="text-xs text-[#1a6fa8] mt-0.5 leading-relaxed">
                  Pastikan Data Yang Anda Masukkan Sudah Benar. Dokumen KK Dan
                  KTP Harus Jelas, Terbaca, Dan Sesuai Dengan Identitas Pemohon.
                </p>
              </div>
            </div>

            {/* Global form error */}
            {formError && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitClick();
              }}
              noValidate
            >
              {/* ── Data Pemohon ─────────────────────────────────── */}
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Data Pemohon
              </h3>
              <div className="flex flex-col gap-4 mb-8">
                {/* Nama Lengkap */}
                <div>
                  <label
                    htmlFor="namaLengkap"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    id="namaLengkap"
                    name="namaLengkap"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.namaLengkap}
                    onChange={handleChange}
                    className="w-full h-[46px] px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>

                {/* NIK */}
                <div>
                  <label
                    htmlFor="nik"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    NIK
                  </label>
                  <input
                    id="nik"
                    name="nik"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="Masukkan NIK"
                    value={formData.nik}
                    onChange={handleChange}
                    className="w-full h-[46px] px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>

                {/* Nomor KK */}
                <div>
                  <label
                    htmlFor="nomorKK"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Nomor KK
                  </label>
                  <input
                    id="nomorKK"
                    name="nomorKK"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="Masukkan nomor KK"
                    value={formData.nomorKK}
                    onChange={handleChange}
                    className="w-full h-[46px] px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>

                {/* Nomor WhatsApp */}
                <div>
                  <label
                    htmlFor="nomorWhatsapp"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Nomor WhatsApp
                  </label>
                  <input
                    id="nomorWhatsapp"
                    name="nomorWhatsapp"
                    type="tel"
                    inputMode="tel"
                    placeholder="Masukkan nomor WhatsApp"
                    value={formData.nomorWhatsapp}
                    onChange={handleChange}
                    className="w-full h-[46px] px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label
                    htmlFor="alamat"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Alamat
                  </label>
                  <input
                    id="alamat"
                    name="alamat"
                    type="text"
                    placeholder="Masukkan alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    className="w-full h-[46px] px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>
              </div>

              {/* ── Detail Permohonan ─────────────────────────────── */}
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Detail Permohonan
              </h3>
              <div className="flex flex-col gap-4 mb-8">
                {/* Jenis Surat (Category) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Jenis Surat
                  </label>
                  {loadingCategories ? (
                    <div className="h-[46px] rounded-lg border border-gray-200 bg-gray-50 flex items-center px-4">
                      <Loader2
                        size={16}
                        className="animate-spin text-gray-400"
                      />
                    </div>
                  ) : (
                    <CustomSelect
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={handleCategoryChange}
                      options={categoryOptions}
                      placeholder="Pilih jenis surat"
                    />
                  )}
                </div>

                {/* Surat (Letter Type) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Surat
                  </label>
                  <CustomSelect
                    id="letterTypeId"
                    value={formData.letterTypeId}
                    onChange={handleLetterTypeChange}
                    options={letterTypeOptions}
                    placeholder="Pilih surat"
                    disabled={!formData.categoryId || loadingCategories}
                  />
                </div>

                {/* Keperluan */}
                <div>
                  <label
                    htmlFor="keperluan"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Keperluan
                  </label>
                  <input
                    id="keperluan"
                    name="keperluan"
                    type="text"
                    placeholder="Masukkan keperluan"
                    value={formData.keperluan}
                    onChange={handleChange}
                    className="w-full h-[46px] px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>
              </div>

              {/* ── Upload Dokumen ────────────────────────────────── */}
              <div className="flex flex-col gap-6 mb-8">
                <FileUploadZone
                  id="kkFile"
                  label="Unggah Kartu Keluarga"
                  file={kkFile}
                  onFileChange={handleKkFileChange}
                  onRemove={() => setKkFile(null)}
                />
                <FileUploadZone
                  id="ktpFile"
                  label="Unggah KTP"
                  file={ktpFile}
                  onFileChange={handleKtpFileChange}
                  onRemove={() => setKtpFile(null)}
                />
              </div>

              {/* ── Actions ───────────────────────────────────────── */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/40"
                >
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />

      {/* Submission Confirmation Modal */}
      <SubmissionConfirmModal
        isOpen={confirmOpen}
        onClose={() => !isSubmitting && setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
