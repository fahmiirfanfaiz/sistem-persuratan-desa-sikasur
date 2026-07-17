"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message || "Login gagal. Periksa kembali email dan password Anda."
        );
        return;
      }

      // Store the access token and user info
      if (data.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
      }
      if (data.data?.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      // Redirect to landing page after successful login
      router.push("/");
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
        <div className="mb-7 text-center">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Sistem Persuratan Digital
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Desa Sikasur</p>
        </div>

        {/* Registered Success Alert */}
        {justRegistered && (
          <div className="w-full mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            Registrasi berhasil! Silakan masuk dengan akun Anda.
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="w-full mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
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
                placeholder="kiranacantik@example.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 py-3 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
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
                autoComplete="current-password"
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 py-3 h-[46px] rounded-lg border-gray-300 text-gray-700 placeholder:text-gray-400 focus-visible:border-[#1a2e6f] focus-visible:ring-[#1a2e6f]/20"
                required
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
            {/* Forgot Password */}
            <div className="flex justify-end mt-1.5">
              <Link
                href="/forgot-password"
                className="text-sm text-[#1a2e6f] hover:underline"
              >
                Lupa password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-masuk"
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-[#1a2e6f] py-3 h-[46px] text-sm font-semibold text-white hover:bg-[#152460] active:bg-[#0f1a4d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-medium text-[#1a2e6f] hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#dde6f5]">
          <Loader2 size={32} className="animate-spin text-[#1a2e6f]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
