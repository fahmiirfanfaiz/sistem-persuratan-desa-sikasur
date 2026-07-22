"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";

function formatDate(iso) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

const STATUS_BADGE = {
  PENDING: { label: "Menunggu", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  ON_PROCESS: { label: "Diproses", cls: "bg-blue-50 text-blue-600 border-blue-200" },
  APPROVED: { label: "Disetujui", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  REJECTED: { label: "Ditolak", cls: "bg-red-50 text-red-600 border-red-200" },
  COMPLETED: { label: "Selesai", cls: "bg-violet-50 text-violet-600 border-violet-200" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.PENDING;
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function PermohonanPage() {
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        search,
        sort,
        page: String(page),
        limit: String(limit),
      });
      const res = await apiFetch(`/api/admin/submissions?${params}`);
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.submissions ?? []);
        setTotal(json.total ?? 0);
      } else {
        setError(json.message || "Gagal memuat data");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [search, sort, page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSort((s) => (s === "newest" ? "oldest" : "newest"));
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Permohonan Surat</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola permohonan surat yang telah diajukan.</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="admin-permohonan-search"
              type="text"
              placeholder="Cari nama pemohon atau jenis surat..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition bg-white"
            />
          </div>
        </form>
        <button
          onClick={handleSortToggle}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition bg-white"
        >
          <ArrowUpDown size={14} />
          {sort === "newest" ? "Terbaru" : "Terlama"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={28} className="animate-spin text-[#1a2e6f]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-center">
            <AlertCircle size={36} className="text-red-400 mb-3" />
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-lg hover:bg-[#1a2e6f]/5 transition">Coba Lagi</button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-sm text-gray-400">Tidak ada permohonan ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Nama Pemohon</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Jenis Surat</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">No Telepon</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Tanggal Pengajuan</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr key={sub.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{sub.user?.name ?? "-"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[#1a2e6f] font-medium">{sub.letterType?.name ?? "-"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{sub.user?.phoneNumber ?? "-"}</td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(sub.createdAt)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={sub.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/permohonan/${sub.id}`}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#1a2e6f] hover:bg-[#1a2e6f]/10 transition"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="h-8 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2e6f]/30"
            >
              {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="mr-2">
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronsLeft size={15} /></button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronRight size={15} /></button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronsRight size={15} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
