"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  LogOut,
  Play,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Read auth state from localStorage (client-side only)
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    router.refresh();
  };

  const handleCta = () => {
    if (user) {
      router.push("/submission");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* ── Navbar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1140px] mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src="/images/logo-pemalang.svg"
              alt="Logo Pemalang"
              width={32}
              height={43}
              className="object-contain"
              priority
            />
            <span className="text-[11px] font-bold text-[#1a2e6f] uppercase leading-tight max-w-[180px]">
              Sistem Persuratan Digital
            </span>
          </Link>

          {/* Right side */}
          {user ? (
            /* Authenticated: user avatar + name */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-gray-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a2e6f] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={14} />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated: Masuk + Daftar */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-lg hover:bg-[#1a2e6f]/5 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#1a2e6f] rounded-lg hover:bg-[#152460] transition"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero Section ─────────────────────────────── */}
        <section className="relative w-full min-h-[540px] flex items-center justify-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="/images/background-1.svg"
              alt=""
              fill
              className="object-cover object-center"
              priority
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-[#0a0f2e]/65" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto py-24">
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
              Sistem Informasi
              <br />
              Layanan Persuratan Desa Sikasur
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Melayani kebutuhan administrasi masyarakat secara lebih mudah,
              cepat, dan terintegrasi melalui sistem pengajuan surat berbasis
              digital.
            </p>
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 bg-[#1a2e6f] hover:bg-[#152460] text-white font-semibold text-sm px-7 py-3 rounded-lg transition shadow-lg"
            >
              Ajukan Permohonan <ArrowRight size={16} />
            </button>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
            <svg
              viewBox="0 0 1440 80"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              className="w-full h-[60px] sm:h-[80px]"
            >
              <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#ffffff" />
            </svg>
          </div>
        </section>

        {/* ── Persyaratan Pengajuan Surat ───────────────── */}
        <section className="bg-white py-20">
          <div className="max-w-[1140px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900">
                Persyaratan Pengajuan Surat
              </h2>
              <div className="mx-auto mt-3 h-[3px] w-20 rounded-full bg-[#1a2e6f]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {/* KTP */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-[#1a2e6f] flex items-center justify-center bg-white shadow-sm">
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1a2e6f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 11c0 2.209-1.791 4-4 4s-4-1.791-4-4 1.791-4 4-4 4 1.791 4 4z" />
                    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                    <path d="M7 17c0-2.21 2.239-4 5-4s5 1.79 5 4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Kartu Tanda Penduduk (KTP)
                </p>
              </div>

              {/* KK */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-[#1a2e6f] flex items-center justify-center bg-white shadow-sm">
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1a2e6f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    <path d="M8 18c0-2.209 1.791-4 4-4s4 1.791 4 4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Kartu Keluarga (KK)
                </p>
              </div>

              {/* WhatsApp */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-[#1a2e6f] flex items-center justify-center bg-white shadow-sm">
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1a2e6f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Nomor Whatsapp yang dapat dihubungi
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tutorial Pengajuan Surat ──────────────────── */}
        <section className="bg-[#f0f4fb] py-20">
          <div className="max-w-[1140px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900">
                Tutorial Pengajuan Surat
              </h2>
              <div className="mx-auto mt-3 h-[3px] w-20 rounded-full bg-[#1a2e6f]" />
            </div>

            {/* Video Placeholder */}
            <div className="max-w-[860px] mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-800 aspect-video flex items-center justify-center group cursor-pointer">
                <Image
                  src="/images/background-2.svg"
                  alt="Tutorial thumbnail"
                  fill
                  className="object-cover opacity-60"
                />
                <div className="relative z-10 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play
                    size={28}
                    className="text-[#1a2e6f] ml-1"
                    fill="#1a2e6f"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────── */}
        <section className="relative w-full py-28 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/background-1.svg"
              alt=""
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#0a0f2e]/70" />
          </div>
          <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ajukan Permohonan Surat Sekarang!
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-8 leading-relaxed">
              Pengajuan permohonan surat dilakukan secara online melalui sistem
              yang tersedia. Proses pendaftaran mudah, cepat, dan terintegrasi.
            </p>
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 bg-[#1a2e6f] hover:bg-[#152460] text-white font-semibold text-sm px-7 py-3 rounded-lg transition shadow-lg"
            >
              Ajukan Permohonan <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="bg-[#0d1b4b] text-gray-300">
        <div className="max-w-[1140px] mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Logo + Jam Pelayanan */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <Image
                src="/images/logo-pemalang.svg"
                alt="Logo Pemalang"
                width={32}
                height={43}
                className="object-contain"
              />
              <span className="text-[11px] font-bold text-white uppercase leading-tight max-w-[200px]">
                Sistem Persuratan Digital
              </span>
            </Link>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">
                Jam Pelayanan
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Senin s.d. Kamis : 08.00 – 15.00 WIB
                <br />
                Jumat : 08.00 – 13.00 WIB
                <br />
                Sabtu, Minggu, dan Hari Libur Nasional : Libur
              </p>
            </div>
          </div>

          {/* Kontak */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Kontak
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-xs text-gray-400 hover:text-white transition"
              >
                <MapPin size={13} className="mt-0.5 flex-shrink-0" />
                VRQF+JPH, Sikasur, Kec. Belik, Kabupaten Pemalang
              </a>
              <a
                href="tel:+62276137716"
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition"
              >
                <Phone size={13} className="flex-shrink-0" />
                (0276) 137716
              </a>
              <a
                href="tel:+62276137718"
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition"
              >
                <Phone size={13} className="flex-shrink-0" />
                (0276) 137718
              </a>
              <a
                href="mailto:balaidesasikasur@gmail.com"
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition"
              >
                <Mail size={13} className="flex-shrink-0" />
                balaidesasikasur@gmail.com
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Social Media
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/gemercikbelik"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://www.youtube.com/@KKNBelikUGM"
                aria-label="YouTube"
                className="text-gray-400 hover:text-white transition"
              >
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-4 text-center text-[11px] text-gray-500">
          Developed by{" "}
          <span className="font-semibold text-gray-400">
            KKN-PPM UGM Periode II 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
