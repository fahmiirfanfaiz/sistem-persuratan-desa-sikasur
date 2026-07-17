"use client";

import { useParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SubmissionSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params?.id ?? "";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f0f4fb]">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative w-full py-10 overflow-hidden" style={{ minHeight: 140 }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/background-1.svg')" }}
        />
        <div className="absolute inset-0 bg-[#0a0f2e]/65" />

        <div className="relative z-10 max-w-[1140px] mx-auto px-6 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Pengajuan Permohonan Surat
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            Lengkapi formulir berikut untuk mengajukan permohonan surat
          </p>
        </div>
      </section>

      {/* Success Card */}
      <main className="flex-1 py-14">
        <div className="max-w-[640px] mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Pengajuan Permohonan Surat Berhasil Dikirim
            </h2>
            <p className="text-sm text-gray-500 mb-7 leading-relaxed max-w-[420px]">
              Terima kasih, permohonan surat Anda telah berhasil masuk ke sistem
              admin desa.
            </p>

            {/* Submission ID box */}
            <div className="w-full border-2 border-[#1a2e6f]/30 rounded-xl bg-[#f5f7ff] px-6 py-5 mb-8">
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                Nomor Permohonan Surat Anda
              </p>
              <p className="text-base font-bold text-[#1a2e6f] tracking-wide break-all">
                {submissionId}
              </p>
            </div>

            {/* Next Steps */}
            <div className="w-full text-left">
              <p className="text-sm font-bold text-gray-900 mb-2 text-center">
                Langkah Selanjutnya
              </p>
              <p className="text-sm text-gray-600 leading-relaxed text-center">
                Permohonan Anda akan diperiksa dan dikelola oleh admin Balai
                Desa Sikasur.
              </p>
              <p className="text-sm text-gray-500 mt-3 text-center leading-relaxed">
                Jika surat sudah selesai diproses, petugas balai desa akan
                menghubungi Anda melalui nomor WhatsApp yang telah didaftarkan.
                Untuk informasi lebih lanjut atau kendala pengajuan, silakan
                hubungi Balai Desa Sikasur melalui WhatsApp: 0877-876-8765.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:justify-center">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2.5 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-lg hover:bg-[#1a2e6f]/5 transition focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20"
              >
                Kembali ke Beranda
              </button>
              <button
                onClick={() => router.push("/submission")}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/40"
              >
                Ajukan Permohonan Lain
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
