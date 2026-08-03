'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  Upload,
  Camera,
  X,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubmissionConfirmModal from '@/components/SubmissionConfirmModal';
import { getStoredUser, apiFetch } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Batasan ukuran file: 2 MB per file agar total kedua file (KK + KTP) aman di bawah batas 4.5 MB request body serverless Vercel
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_TOTAL_SIZE_MB = 4;
const MAX_TOTAL_SIZE = MAX_TOTAL_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

function isPdf(file) {
  return file?.type === 'application/pdf';
}

function DocumentUploadZone({ label, documentName, file, error, onFileChange, onRemove, id }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
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
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-[11px] text-gray-400 font-medium">Maks. 2 MB</span>
      </div>

      {file ? (
        <div className="relative border border-emerald-200 rounded-xl bg-emerald-50/40 p-4 flex items-center gap-3 transition">
          {!isPdf(file) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-14 h-14 object-cover rounded-lg border border-emerald-200 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center shrink-0 shadow-xs">
              <FileText size={26} className="text-red-500" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              <span>·</span>
              <span className="font-medium text-emerald-700">{isPdf(file) ? 'Dokumen PDF' : 'Gambar'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Hapus file"
            aria-label="Hapus file"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <>
          <div
            role="button"
            tabIndex={0}
            aria-label={`Unggah ${label}`}
            className={`border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 py-7 px-4 ${
              error
                ? 'border-red-300 bg-red-50/40 hover:bg-red-50/60'
                : dragging
                ? 'border-[#1a2e6f] bg-[#1a2e6f]/5'
                : 'border-gray-300 hover:border-[#1a2e6f] hover:bg-gray-50/80'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${error ? 'bg-red-100 text-red-600' : 'bg-[#1a2e6f]/10 text-[#1a2e6f]'}`}>
              <Upload size={20} strokeWidth={1.8} />
            </div>
            <p className="text-sm font-medium text-gray-700 text-center">
              Klik untuk memilih file atau seret & lepas di sini
            </p>
            <p className="text-xs text-gray-400 text-center">
              Format yang didukung: <span className="font-medium text-gray-600">JPG, PNG, WEBP, atau PDF</span> (Maks. 2 MB)
            </p>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a2e6f]/10 text-[#1a2e6f] font-semibold text-sm rounded-xl hover:bg-[#1a2e6f]/20 transition border border-[#1a2e6f]/20"
            >
              <Camera size={16} />
              Ambil Foto Langsung
            </button>
          </div>
        </>
      )}

      {/* Inline Humanist Error Message */}
      {error && (
        <div className="mt-2.5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 animate-in fade-in duration-200">
          <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="text-gray-600 mt-1">
              💡 <strong>Tips:</strong> Anda dapat mengompres gambar melalui aplikasi foto bawaan, melakukan tangkapan layar (screenshot), atau memilih resolusi standar.
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function CustomSelect({ id, value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between h-11.5 px-4 rounded-lg border text-sm transition ${
          disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white cursor-pointer'
        } ${open ? 'border-[#1a2e6f] ring-2 ring-[#1a2e6f]/20' : 'border-gray-300'} text-left`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && options.length > 0 && (
        <div role="listbox" className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-4 py-3 text-sm cursor-pointer transition ${
                opt.value === value ? 'bg-[#eef1fb] text-[#1a2e6f] font-medium' : 'text-gray-700 hover:bg-gray-50'
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

function onlyDigits(value) {
  return value.replace(/\D/g, '');
}

export default function SubmissionPage() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    namaLengkap: '',
    nik: '',
    nomorKK: '',
    nomorWhatsapp: '',
    alamat: '',
    categoryId: '',
    letterTypeId: '',
    keperluan: '',
  });

  const [fieldErrors, setFieldErrors] = useState({ nik: '', nomorKK: '' });
  const [fileErrors, setFileErrors] = useState({ kkFile: '', ktpFile: '' });
  const [kkFile, setKkFile] = useState(null);
  const [ktpFile, setKtpFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }
    setIsAuthChecked(true);

    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/api/users/me');
        if (res.ok) {
          const json = await res.json();
          const profile = json.data ?? json;
          setFormData((prev) => ({
            ...prev,
            namaLengkap: profile.name || storedUser.name || '',
            nik: profile.nik || '',
            nomorKK: profile.familyCardNumber || '',
            nomorWhatsapp: profile.phoneNumber || '',
            alamat: profile.address || '',
          }));
        } else {
          setFormData((prev) => ({ ...prev, namaLengkap: storedUser.name || '' }));
        }
      } catch {
        setFormData((prev) => ({ ...prev, namaLengkap: storedUser.name || '' }));
      }
    };
    fetchProfile();
  }, [router]);

  useEffect(() => {
    if (!isAuthChecked) return;
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/letters/categories`);
        const json = await res.json();
        if (json.success) setCategories(json.data);
      } catch {
        // ignore
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [isAuthChecked]);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const letterTypeOptions = selectedCategory
    ? selectedCategory.letterTypes.map((lt) => ({ value: lt.id, label: lt.name }))
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const digits = onlyDigits(value);
    setFormData((prev) => ({ ...prev, [name]: digits }));
    if (formError) setFormError('');

    if (digits.length > 0 && digits.length < 16) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: `Baru ${digits.length} dari 16 digit (kurang ${16 - digits.length} digit lagi)`,
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => ({ ...prev, categoryId, letterTypeId: '' }));
    if (formError) setFormError('');
  };

  const handleLetterTypeChange = (letterTypeId) => {
    setFormData((prev) => ({ ...prev, letterTypeId }));
    if (formError) setFormError('');
  };

  // Validasi Humanis untuk File Satuan & Total
  const validateSingleFile = (file, documentName, fieldKey) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      const errMsg = `Format file "${file.name}" tidak didukung. Mohon gunakan foto (JPG, PNG, WEBP) atau PDF.`;
      setFileErrors((prev) => ({ ...prev, [fieldKey]: errMsg }));
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errMsg = `Ukuran file ${documentName} (${sizeMB} MB) melebihi batas maksimal 2 MB.`;
      setFileErrors((prev) => ({ ...prev, [fieldKey]: errMsg }));
      return false;
    }

    setFileErrors((prev) => ({ ...prev, [fieldKey]: '' }));
    if (formError) setFormError('');
    return true;
  };

  const handleKkFileChange = (file) => {
    if (validateSingleFile(file, 'Kartu Keluarga', 'kkFile')) {
      // Cek total jika ktpFile sudah ada
      if (ktpFile && file.size + ktpFile.size > MAX_TOTAL_SIZE) {
        const totalMB = ((file.size + ktpFile.size) / (1024 * 1024)).toFixed(2);
        setFormError(`Total ukuran file KK dan KTP (${totalMB} MB) melebihi batas 4 MB. Mohon kurangi ukuran salah satu file.`);
      }
      setKkFile(file);
    }
  };

  const handleKtpFileChange = (file) => {
    if (validateSingleFile(file, 'KTP', 'ktpFile')) {
      // Cek total jika kkFile sudah ada
      if (kkFile && file.size + kkFile.size > MAX_TOTAL_SIZE) {
        const totalMB = ((file.size + kkFile.size) / (1024 * 1024)).toFixed(2);
        setFormError(`Total ukuran file KK dan KTP (${totalMB} MB) melebihi batas 4 MB. Mohon kurangi ukuran salah satu file.`);
      }
      setKtpFile(file);
    }
  };

  const validateForm = () => {
    if (!formData.namaLengkap.trim()) return 'Mohon lengkapi Nama Lengkap Anda.';
    if (!formData.nik.trim()) return 'Mohon isi NIK (Nomor Induk Kependudukan).';
    if (formData.nik.length !== 16) return 'NIK harus terdiri dari tepat 16 digit angka.';
    if (!formData.nomorKK.trim()) return 'Mohon isi Nomor Kartu Keluarga.';
    if (formData.nomorKK.length !== 16) return 'Nomor KK harus terdiri dari tepat 16 digit angka.';
    if (!formData.nomorWhatsapp.trim()) return 'Mohon isi Nomor WhatsApp aktif pemohon.';
    if (!formData.alamat.trim()) return 'Mohon isi Alamat lengkap pemohon.';
    if (!formData.categoryId) return 'Mohon pilih Jenis Surat yang diajukan.';
    if (!formData.letterTypeId) return 'Mohon pilih Surat permohonan.';
    if (!formData.keperluan.trim()) return 'Mohon jelaskan Keperluan permohonan surat.';
    if (!kkFile) return 'Mohon unggah dokumen Kartu Keluarga (KK).';
    if (!ktpFile) return 'Mohon unggah dokumen KTP.';

    // Validasi kumulatif ukuran kedua file
    const totalSize = (kkFile?.size || 0) + (ktpFile?.size || 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
      return `Total ukuran file KK dan KTP (${totalMB} MB) melebihi batas aman 4 MB. Mohon gunakan dokumen dengan resolusi lebih ringkas.`;
    }

    return null;
  };

  const handleSubmitClick = () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append('letterTypeId', formData.letterTypeId);
      body.append('purpose', formData.keperluan.trim());
      body.append('kkFile', kkFile);
      body.append('ktpFile', ktpFile);

      const res = await apiFetch('/api/submissions', { method: 'POST', body });
      const json = await res.json();

      if (!res.ok) {
        setConfirmOpen(false);
        setFormError(json.message || 'Terjadi kendala saat memproses permohonan. Silakan periksa kembali data Anda.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      router.push(`/submission/success/${json.data.submissionId}`);
    } catch {
      setConfirmOpen(false);
      setFormError('Tidak dapat terhubung ke server. Pastikan koneksi internet stabil dan total dokumen tidak melebihi batas upload.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4fb]">
        <Loader2 size={32} className="animate-spin text-[#1a2e6f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f0f4fb]">
      <Navbar />

      <section className="relative w-full py-10 flex items-center overflow-hidden" style={{ minHeight: 140 }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/background-1.svg')" }} />
        <div className="absolute inset-0 bg-[#0a0f2e]/65" />
        <div className="relative z-10 max-w-285 mx-auto px-6 w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3 transition"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Pengajuan Permohonan Surat</h1>
          <p className="text-gray-300 text-sm mt-1">Lengkapi formulir berikut untuk mengajukan permohonan surat</p>
        </div>
      </section>

      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-180 mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-6 sm:px-8 sm:py-8">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Data Permohonan Surat</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Silakan lengkapi data diri dan dokumen pendukung untuk mengajukan permohonan surat.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-[#e8f4fd] border border-[#b3d9f5] rounded-xl px-4 py-3.5 mb-8">
              <AlertCircle size={18} className="text-[#1a6fa8] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#1a6fa8]">Panduan Pengunggahan Dokumen</p>
                <p className="text-[11px] sm:text-xs text-[#1a6fa8] mt-0.5 leading-relaxed">
                  Dokumen KK dan KTP harus jelas dan terbaca. Format yang didukung adalah <strong>JPG, PNG, WEBP, atau PDF</strong> dengan ukuran <strong>maksimal 2 MB per dokumen</strong>.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{formError}</p>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSubmitClick(); }} noValidate>
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Data Pemohon</h3>
              <div className="flex flex-col gap-4 mb-8">
                <div>
                  <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input
                    id="namaLengkap"
                    name="namaLengkap"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.namaLengkap}
                    onChange={handleChange}
                    className="w-full h-11.5 px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK (Nomor Induk Kependudukan)</label>
                    <span className={`text-[11px] font-medium ${formData.nik.length === 16 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {formData.nik.length}/16 digit
                    </span>
                  </div>
                  <input
                    id="nik"
                    name="nik"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="Masukkan 16 digit NIK"
                    value={formData.nik}
                    onChange={handleNumericChange}
                    className={`w-full h-11.5 px-4 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition ${
                      fieldErrors.nik ? 'border-amber-400 bg-amber-50/40' : formData.nik.length === 16 ? 'border-emerald-400' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.nik ? (
                    <p className="mt-1 text-xs text-amber-700 font-medium">{fieldErrors.nik}</p>
                  ) : formData.nik.length === 16 ? (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">✓ 16 digit NIK lengkap</p>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="nomorKK" className="block text-sm font-medium text-gray-700">Nomor Kartu Keluarga (KK)</label>
                    <span className={`text-[11px] font-medium ${formData.nomorKK.length === 16 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {formData.nomorKK.length}/16 digit
                    </span>
                  </div>
                  <input
                    id="nomorKK"
                    name="nomorKK"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="Masukkan 16 digit nomor KK"
                    value={formData.nomorKK}
                    onChange={handleNumericChange}
                    className={`w-full h-11.5 px-4 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition ${
                      fieldErrors.nomorKK ? 'border-amber-400 bg-amber-50/40' : formData.nomorKK.length === 16 ? 'border-emerald-400' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.nomorKK ? (
                    <p className="mt-1 text-xs text-amber-700 font-medium">{fieldErrors.nomorKK}</p>
                  ) : formData.nomorKK.length === 16 ? (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">✓ 16 digit Nomor KK lengkap</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="nomorWhatsapp" className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp Aktif</label>
                  <input
                    id="nomorWhatsapp"
                    name="nomorWhatsapp"
                    type="tel"
                    inputMode="tel"
                    placeholder="Contoh: 081234567890"
                    value={formData.nomorWhatsapp}
                    onChange={handleChange}
                    className="w-full h-11.5 px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                  <p className="mt-1 text-xs text-gray-400">Pemberitahuan status surat akan dikirimkan ke nomor ini.</p>
                </div>

                <div>
                  <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Tempat Tinggal</label>
                  <input
                    id="alamat"
                    name="alamat"
                    type="text"
                    placeholder="Masukkan alamat lengkap (RT/RW, Dusun)"
                    value={formData.alamat}
                    onChange={handleChange}
                    className="w-full h-11.5 px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-800 mb-4">Detail Permohonan</h3>
              <div className="flex flex-col gap-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Surat</label>
                  {loadingCategories ? (
                    <div className="h-11.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-4">
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <CustomSelect
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={handleCategoryChange}
                      options={categoryOptions}
                      placeholder="Pilih kategori jenis surat"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Surat yang Diajukan</label>
                  <CustomSelect
                    id="letterTypeId"
                    value={formData.letterTypeId}
                    onChange={handleLetterTypeChange}
                    options={letterTypeOptions}
                    placeholder="Pilih nama surat"
                    disabled={!formData.categoryId || loadingCategories}
                  />
                </div>

                <div>
                  <label htmlFor="keperluan" className="block text-sm font-medium text-gray-700 mb-1.5">Keperluan Pengajuan</label>
                  <input
                    id="keperluan"
                    name="keperluan"
                    type="text"
                    placeholder="Contoh: Persyaratan pendaftaran beasiswa / melamar pekerjaan"
                    value={formData.keperluan}
                    onChange={handleChange}
                    className="w-full h-11.5 px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-800 mb-4">Dokumen Persyaratan</h3>
              <div className="flex flex-col gap-6 mb-8">
                <DocumentUploadZone
                  id="kkFile"
                  label="Unggah Kartu Keluarga (KK)"
                  documentName="Kartu Keluarga"
                  file={kkFile}
                  error={fileErrors.kkFile}
                  onFileChange={handleKkFileChange}
                  onRemove={() => {
                    setKkFile(null);
                    setFileErrors((prev) => ({ ...prev, kkFile: '' }));
                    if (formError) setFormError('');
                  }}
                />
                <DocumentUploadZone
                  id="ktpFile"
                  label="Unggah KTP Pemohon"
                  documentName="KTP"
                  file={ktpFile}
                  error={fileErrors.ktpFile}
                  onFileChange={handleKtpFileChange}
                  onRemove={() => {
                    setKtpFile(null);
                    setFileErrors((prev) => ({ ...prev, ktpFile: '' }));
                    if (formError) setFormError('');
                  }}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-lg transition cursor-pointer shadow-sm"
                >
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />

      <SubmissionConfirmModal
        isOpen={confirmOpen}
        onClose={() => !isSubmitting && setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}