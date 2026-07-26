"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token reset password tidak ditemukan pada URL.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Password harus minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.message || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#1a2e6f]/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#1a2e6f]/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo-pemalang.svg"
            alt="Logo Pemalang"
            width={48}
            height={64}
            className="object-contain"
            priority
          />
        </div>

        {/* Title */}
        <div className="mb-7 text-center">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Silakan masukkan password baru Anda di bawah ini.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success ? (
          <div className="w-full text-center">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Diperbarui!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Password Anda telah berhasil diubah. Anda akan dialihkan ke halaman login dalam beberapa detik.
            </p>
            <Link href="/login" className="text-sm font-semibold text-[#1a2e6f] hover:underline">
              Ke Halaman Login Sekarang
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password Baru
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} strokeWidth={1.8} />
                </span>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-3 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} strokeWidth={1.8} />
                </span>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Masukkan ulang password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 py-3 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
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
            <Button
              type="submit"
              disabled={isLoading || !token}
              className="w-full h-[46px] mt-2 rounded-lg bg-[#1a2e6f] hover:bg-[#152460] text-white font-semibold transition flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Simpan Password Baru"
              )}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
