"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCheck,
  UserX,
} from "lucide-react";

function formatDate(iso) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditUserModal({ isOpen, onClose, onSave, userData }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "USER",
    isActive: true,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && userData) {
      setForm({
        name: userData.name ?? "",
        email: userData.email ?? "",
        phoneNumber: userData.phoneNumber ?? "",
        address: userData.address ?? "",
        role: userData.role ?? "USER",
        isActive: userData.isActive ?? true,
        password: "",
      });
      setError("");
    }
  }, [isOpen, userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      const res = await apiFetch(`/api/admin/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message || "Terjadi kesalahan"); return; }
      onSave();
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Edit Pengguna</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"><X size={16} /></button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">No Telepon</label>
              <input type="tel" value={form.phoneNumber} onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
              <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Alamat</label>
            <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password Baru <span className="text-gray-400">(biarkan kosong jika tidak diubah)</span></label>
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status Akun</label>
              <div className="flex items-center gap-3 h-10">
                <button type="button"
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isActive ? "bg-[#1a2e6f]" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm font-medium ${form.isActive ? "text-emerald-600" : "text-gray-400"}`}>
                  {form.isActive ? "Aktif" : "Non-aktif"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Batal</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-lg transition disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm, name, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-bold text-gray-900 mb-2">Hapus Pengguna</h2>
        <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold text-gray-700">"{name}"</span>? Semua data terkait akan ikut terhapus.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Batal</button>
          <button onClick={onConfirm} disabled={loading} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function PenggunaPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ search, page: String(page), limit: String(limit) });
      const res = await apiFetch(`/api/admin/users?${params}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.users ?? []);
        setTotal(json.total ?? 0);
      } else {
        setError(json.message || "Gagal memuat data");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) { setDeleteTarget(null); fetchData(); }
      else { const j = await res.json(); alert(j.message || "Gagal menghapus"); }
    } catch { alert("Gagal terhubung ke server"); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola akun pengguna yang terdaftar.</p>
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="mb-4 flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau NIK..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f] transition bg-white"
          />
        </div>
      </form>

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
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-sm text-gray-400">Tidak ada pengguna ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Nama</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">No Telepon</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Pengajuan</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Terdaftar</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1a2e6f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 truncate max-w-[120px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 truncate max-w-[160px]">{u.email}</td>
                    <td className="px-5 py-3.5 text-gray-500">{u.phoneNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${u.role === "ADMIN" ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <UserCheck size={13} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <UserX size={13} /> Non-aktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center text-gray-600 font-medium">{u._count?.submissions ?? 0}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditTarget(u)} className="p-2 rounded-lg text-gray-400 hover:text-[#1a2e6f] hover:bg-[#1a2e6f]/10 transition" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(u)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Hapus">
                          <Trash2 size={15} />
                        </button>
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
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="h-8 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none">
              {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="mr-2">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronsLeft size={15} /></button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronRight size={15} /></button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronsRight size={15} /></button>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditUserModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={() => { setEditTarget(null); fetchData(); }}
        userData={editTarget}
      />
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        name={deleteTarget?.name ?? ""}
        loading={deleting}
      />
    </div>
  );
}
