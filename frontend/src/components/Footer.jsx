"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
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
              href="tel:+620274371716"
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition"
            >
              <Phone size={13} className="flex-shrink-0" />
              (0274)371716
            </a>
            <a
              href="fax:+620274371716"
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition"
            >
              {/* Fax icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <path d="M22 17H2a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h1" />
                <path d="M8 21h8" />
                <rect x="8" y="3" width="8" height="14" rx="2" />
              </svg>
              (0274)371716
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
            Sosial Media
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
  );
}
