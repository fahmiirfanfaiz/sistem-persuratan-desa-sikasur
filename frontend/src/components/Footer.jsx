"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#0d1b4b] text-gray-300">
      <div className="max-w-285 mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
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
            <span className="text-[11px] font-bold text-white uppercase leading-tight max-w-50">
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

        {/* Media Sosial */}
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">
            Media Sosial
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/pemdessikasur"
              aria-label="Instagram"
              className="text-gray-400 hover:text-white transition"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4 text-center text-[11px] text-gray-500">
        Dikembangkan oleh{" "}
        <span className="font-semibold text-gray-400">
          Tim KKN-PPM UGM Gemercik Belik Periode 2 2026
        </span>
      </div>
    </footer>
  );
}
