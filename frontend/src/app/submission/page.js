'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  Upload,
  Camera,
  FolderOpen,
  X,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubmissionConfirmModal from '@/components/SubmissionConfirmModal';
import { getStoredUser, apiFetch } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

function isPdf(file) {
  return file?.type === 'application/pdf';
}

function DocumentUploadZone({ label, file, onFileChange, onRemove, id }) {
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

  if (file) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="relative border border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 flex items-center gap-3">
          {!isPdf(file) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-14 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg border border-gray-200 bg-red-50 flex items-center justify-center flex-shrink-0">
              <FileText size={24} className="text-red-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {(file.size / 1024 / 1024).toFixed(2)} MB · {isPdf(file) ? 'PDF' : 'Gambar'}
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
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Unggah ${label}`}
        className={`border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 py-7 px-4 ${
          dragging ? 'border-[#1a2e6f] bg-[#1a2e6f]/5' : 'border-gray-300 hover:border-[#1a2e6f] hover:bg-gray-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload size={22} className="text-gray-400" strokeWidth={1.5} />
        <p className="text-sm text-gray-500 text-center">Klik Untuk Mengunggah Atau Seret Dan Lepas</p>
        <p className="text-xs text-gray-400">Format: Gambar atau PDF (Maks. 5 MB)</p>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <FolderOpen size={14} />
          Pilih File
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 md:hidden flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#1a2e6f] bg-[#1a2e6f]/10 border border-[#1a2e6f]/30 rounded-lg hover:bg-[#1a2e6f]/20 transition"
        >
          <Camera size={14} />
          Ambil Foto
        </button>
      </div>

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
        className={`w-full flex items-center justify-between h-[46px] px-4 rounded-lg border text-sm transition ${
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
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && options.length > 0 && (
        <div role="listbox" className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
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
      setFieldErrors((prev) => ({ ...prev, [name]: 'Harus 16 digit' }));
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

  const handleFileValidation = (file, fieldName) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      setFormError(`File ${fieldName} harus berformat gambar (JPEG/PNG/WEBP) atau PDF`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFormError(`File ${fieldName} tidak boleh lebih dari 5 MB`);
      return false;
    }
    setFormError('');
    return true;
  };

  const handleKkFileChange = (file) => { if (handleFileValidation(file, 'Kartu Keluarga')) setKkFile(file); };
  const handleKtpFileChange = (file) => { if (handleFileValidation(file, 'KTP')) setKtpFile(file); };

  const validateForm = () => {
    if (!formData.namaLengkap.trim()) return 'Nama lengkap wajib diisi';
    if (!formData.nik.trim()) return 'NIK wajib diisi';
    if (formData.nik.length !== 16) return 'NIK harus 16 digit angka';
    if (!formData.nomorKK.trim()) return 'Nomor KK wajib diisi';
    if (formData.nomorKK.length !== 16) return 'Nomor KK harus 16 digit angka';
    if (!formData.nomorWhatsapp.trim()) return 'Nomor WhatsApp wajib diisi';
    if (!formData.alamat.trim()) return 'Alamat wajib diisi';
    if (!formData.categoryId) return 'Jenis surat wajib dipilih';
    if (!formData.letterTypeId) return 'Surat wajib dipilih';
    if (!formData.keperluan.trim()) return 'Keperluan wajib diisi';
    if (!kkFile) return 'File Kartu Keluarga wajib diunggah';
    if (!ktpFile) return 'File KTP wajib diunggah';
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
        setFormError(json.message || 'Terjadi kesalahan. Silakan coba lagi.');
        return;
      }
      router.push(`/submission/success/${json.data.submissionId}`);
    } catch {
      setConfirmOpen(false);
      setFormError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
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
        <div className="relative z-10 max-w-[1140px] mx-auto px-6 w-full">
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
        <div className="max-w-[720px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-6 sm:px-8 sm:py-8">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Data Permohonan Surat</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Silakan lengkapi data diri dan dokumen pendukung untuk mengajukan permohonan surat.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-[#e8f4fd] border border-[#b3d9f5] rounded-lg px-4 py-3 mb-8">
              <AlertCircle size={18} className="text-[#1a6fa8] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#1a6fa8]">Perhatian</p>
                <p className="text-[11px] sm:text-xs text-[#1a6fa8] mt-0.5 leading-relaxed">
                  Pastikan Data Yang Anda Masukkan Sudah Benar. Dokumen KK Dan KTP Harus Jelas, Terbaca, Dan Sesuai
                  Dengan Identitas Pemohon. Format yang diterima: Gambar (JPEG/PNG/WEBP) atau PDF.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {formError}
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
                    className="w-full h-[46px] px-4 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition"
                  />
                </div>

                <div>
                  <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-1.5">NIK</label>
                  <input
                    id="nik"
                    name="nik"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="Masukkan NIK (16 digit)"
                    value={formData.nik}
                    onChange={handleNumericChange}
                    className={`w-full h-[46px] px-4 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition ${
                      fieldErrors.nik ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.nik && <p className="mt-1 text-xs text-red-600">{fieldErrors.nik}</p>}
                </div>

                <div>
                  <label htmlFor="nomorKK" className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Kartu Keluarga</label>
                  <input
                    id="nomorKK"
                    name="nomorKK"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="Masukkan nomor KK (16 digit)"
                    value={formData.nomorKK}
                    onChange={handleNumericChange}
                    className={`w-full h-[46px] px-4 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition ${
                      fieldErrors.nomorKK ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.nomorKK && <p className="mt-1 text-xs text-red-600">{fieldErrors.nomorKK}</p>}
                </div>

                <div>
                  <label htmlFor="nomorWhatsapp" className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp</label>
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

                <div>
                  <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
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

              <h3 className="text-sm font-semibold text-gray-800 mb-4">Detail Permohonan</h3>
              <div className="flex flex-col gap-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Surat</label>
                  {loadingCategories ? (
                    <div className="h-[46px] rounded-lg border border-gray-200 bg-gray-50 flex items-center px-4">
                      <Loader2 size={16} className="animate-spin text-gray-400" />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Surat</label>
                  <CustomSelect
                    id="letterTypeId"
                    value={formData.letterTypeId}
                    onChange={handleLetterTypeChange}
                    options={letterTypeOptions}
                    placeholder="Pilih surat"
                    disabled={!formData.categoryId || loadingCategories}
                  />
                </div>

                <div>
                  <label htmlFor="keperluan" className="block text-sm font-medium text-gray-700 mb-1.5">Keperluan</label>
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

              <div className="flex flex-col gap-6 mb-8">
                <DocumentUploadZone
                  id="kkFile"
                  label="Unggah Kartu Keluarga"
                  file={kkFile}
                  onFileChange={handleKkFileChange}
                  onRemove={() => setKkFile(null)}
                />
                <DocumentUploadZone
                  id="ktpFile"
                  label="Unggah KTP"
                  file={ktpFile}
                  onFileChange={handleKtpFileChange}
                  onRemove={() => setKtpFile(null)}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-lg transition"
                >
                  Kirim
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