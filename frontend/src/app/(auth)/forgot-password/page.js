"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
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

      <div className="relative z-10 w-full max-w-110 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a2e6f] transition mb-6"
        >
          <ArrowLeft size={16} />
          Kembali ke Login
        </Link>

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
            Lupa Password
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang password Anda.
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Terkirim!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Silakan periksa kotak masuk (atau folder spam) di email <span className="font-semibold text-gray-700">{email}</span> untuk instruksi selanjutnya.
            </p>
            <Button
              type="button"
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
              variant="outline"
              className="w-full h-11.5 rounded-lg text-sm font-semibold"
            >
              Kirim ulang email
            </Button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
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
                  placeholder="johndoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-3 h-11.5 rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11.5 mt-2 rounded-lg bg-[#1a2e6f] hover:bg-[#152460] text-white font-semibold transition flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Tautan Reset"
              )}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
