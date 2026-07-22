"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  BookUser,
  ChevronRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStoredUser, apiFetch } from "@/lib/api";

// ─── Field Row ─────────────────────────────────────────────────────────────────
function ProfileField({ icon: Icon, label, value, name, isEditing, onChange, type = "text", readOnly = false }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-[#1a2e6f]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className="text-[#1a2e6f]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        {isEditing && !readOnly ? (
          <input
            type={type}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/30 focus:border-[#1a2e6f] transition"
          />
        ) : (
          <p className={`text-sm font-medium ${value ? "text-gray-900" : "text-gray-400 italic"}`}>
            {value || "Belum diisi"}
          </p>
        )}
      </div>
      {readOnly && isEditing && (
        <span className="text-[10px] text-gray-300 bg-gray-100 rounded px-1.5 py-0.5 mt-1 flex-shrink-0">
          Terkunci
        </span>
      )}
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-2 duration-200 ${
        type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-red-50 border-red-200 text-red-600"
      }`}
    >
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100 transition">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/api/users/me");
        if (!res.ok) throw new Error("Gagal memuat profil");
        const json = await res.json();
        setProfile(json.data);
        setForm(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setForm(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phoneNumber: form.phoneNumber,
          address: form.address,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan perubahan");

      setProfile(json.data);
      setForm(json.data);

      // Update localStorage so Navbar shows updated name
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: json.data.name, email: json.data.email }));

      setIsEditing(false);
      setToast({ message: "Profil berhasil diperbarui!", type: "success" });
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const initial = profile?.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto w-full px-6 py-10">
        {/* Back button + Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#1a2e6f] transition">Beranda</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Profil Pengguna</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#1a2e6f] transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 size={32} className="animate-spin text-[#1a2e6f]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-24 text-center">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left: Avatar Card ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a2e6f] to-[#2d4fbd] text-white flex items-center justify-center text-4xl font-bold shadow-lg mb-4">
                  {initial}
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-0.5">{profile?.name}</h2>
                <p className="text-xs text-gray-400 mb-4">{profile?.email}</p>

                {/* Role Badge */}
                <span className="px-3 py-1 text-[11px] font-semibold text-[#1a2e6f] bg-[#1a2e6f]/10 rounded-full uppercase tracking-wide">
                  {profile?.role === "ADMIN" ? "Admin" : "Pengguna"}
                </span>

                {/* Member since */}
                <div className="mt-5 pt-5 border-t border-gray-100 w-full">
                  <p className="text-xs text-gray-400">Bergabung sejak</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {profile?.createdAt
                      ? new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(profile.createdAt))
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: Detail Card ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-[#1a2e6f]" />
                    <h2 className="text-base font-bold text-gray-900">Data Pribadi</h2>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1a2e6f] border border-[#1a2e6f]/30 rounded-lg hover:bg-[#1a2e6f]/5 transition"
                    >
                      <Edit3 size={13} />
                      Ubah
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <X size={13} />
                        Batal
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1a2e6f] rounded-lg hover:bg-[#152460] transition disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Save size={13} />
                        )}
                        Simpan
                      </button>
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="px-6 pb-2">
                  <ProfileField
                    icon={User}
                    label="Nama Lengkap"
                    name="name"
                    value={isEditing ? form.name : profile?.name}
                    isEditing={isEditing}
                    onChange={handleChange}
                  />
                  <ProfileField
                    icon={Mail}
                    label="Email"
                    name="email"
                    value={profile?.email}
                    isEditing={isEditing}
                    onChange={handleChange}
                    readOnly
                  />
                  <ProfileField
                    icon={Phone}
                    label="Nomor Telepon"
                    name="phoneNumber"
                    value={isEditing ? form.phoneNumber : profile?.phoneNumber}
                    isEditing={isEditing}
                    onChange={handleChange}
                    type="tel"
                  />
                  <ProfileField
                    icon={MapPin}
                    label="Alamat"
                    name="address"
                    value={isEditing ? form.address : profile?.address}
                    isEditing={isEditing}
                    onChange={handleChange}
                  />
                  <ProfileField
                    icon={CreditCard}
                    label="NIK"
                    name="nik"
                    value={profile?.nik}
                    isEditing={isEditing}
                    onChange={handleChange}
                    readOnly
                  />
                  <ProfileField
                    icon={BookUser}
                    label="Nomor Kartu Keluarga"
                    name="familyCardNumber"
                    value={profile?.familyCardNumber}
                    isEditing={isEditing}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <Footer />
    </div>
  );
}
