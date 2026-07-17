"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Contact,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    nomorHandphone: "",
    alamat: "",
    password: "",
    konfirmasiPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.konfirmasiPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.namaLengkap,
          email: formData.email,
          phoneNumber: formData.nomorHandphone,
          address: formData.alamat,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message || "Registrasi gagal. Periksa kembali data Anda."
        );
        return;
      }

      // Redirect to login after successful registration
      router.push("/login?registered=true");
    } catch {
      setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dde6f5] px-4 py-12">
      <div className="w-full max-w-[478px] bg-white rounded-2xl shadow-lg px-10 py-10 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-5 flex flex-col items-center">
          <div className="w-[55px] h-[74px] flex items-center justify-center">
            <Image
              src="/images/logo-pemalang.svg"
              alt="Logo Kabupaten Pemalang"
              width={55}
              height={74}
              priority
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-7 tracking-tight">
          Daftar Akun Baru
        </h1>

        {/* Error Alert */}
        {error && (
          <div className="w-full mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Nama Lengkap */}
          <div>
            <label
              htmlFor="namaLengkap"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={18} strokeWidth={1.8} />
              </span>
              <Input
                id="namaLengkap"
                name="namaLengkap"
                type="text"
                autoComplete="name"
                placeholder="Kirana Kartika"
                value={formData.namaLengkap}
                onChange={handleChange}
                className="pl-10 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} strokeWidth={1.8} />
              </span>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="kiranacantik@example.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Nomor Handphone */}
          <div>
            <label
              htmlFor="nomorHandphone"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Nomor Handphone
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                <Contact size={18} strokeWidth={1.8} />
              </span>
              <Input
                id="nomorHandphone"
                name="nomorHandphone"
                type="tel"
                autoComplete="tel"
                placeholder="082328775373"
                value={formData.nomorHandphone}
                onChange={handleChange}
                className="pl-10 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label
              htmlFor="alamat"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Alamat
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                <MapPin size={18} strokeWidth={1.8} />
              </span>
              <Input
                id="alamat"
                name="alamat"
                type="text"
                autoComplete="street-address"
                placeholder="Sikasur, Kec. Belik, Kabupaten Pemalang, Jawa..."
                value={formData.alamat}
                onChange={handleChange}
                className="pl-10 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} strokeWidth={1.8} />
              </span>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                required
                minLength={8}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={1.8} />
                ) : (
                  <Eye size={18} strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label
              htmlFor="konfirmasiPassword"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Konfirmasi Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} strokeWidth={1.8} />
              </span>
              <Input
                id="konfirmasiPassword"
                name="konfirmasiPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Ulangi password"
                value={formData.konfirmasiPassword}
                onChange={handleChange}
                className="pl-10 pr-10 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                required
                minLength={8}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi password"
                    : "Tampilkan konfirmasi password"
                }
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} strokeWidth={1.8} />
                ) : (
                  <Eye size={18} strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-daftar"
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-[#1a2e6f] py-3 h-[46px] text-sm font-semibold text-white hover:bg-[#152460] active:bg-[#0f1a4d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-[#1a2e6f] hover:underline">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
