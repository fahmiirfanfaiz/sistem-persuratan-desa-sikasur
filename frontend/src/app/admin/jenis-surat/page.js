"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle } from "lucide-react";

// ─── Modals ────────────────────────────────────────────────────────────────────
function LetterTypeModal({ isOpen, onClose, onSave, categories, editData }) {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    letterCategoryId: "",
    name: "",
    description: "",
    templatePath: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({
          letterCategoryId: editData.letterCategoryId ?? "",
          name: editData.name ?? "",
          description: editData.description ?? "",
          templatePath: editData.templatePath ?? "",
        });
      } else {
        setForm({ letterCategoryId: categories[0]?.id ?? "", name: "", description: "", templatePath: "" });
      }
      setError("");
    }
  }, [isOpen, editData, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Nama surat wajib diisi"); return; }
    setLoading(true);
    setError("");
    try {
      const path = isEdit
        ? `/api/admin/letter-types/${editData.id}`
        : `/api/admin/letter-types`;
      const method = isEdit ? "PUT" : "POST";
      const res = await apiFetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? "Edit Jenis Surat" : "Tambah Jenis Surat"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"><X size={16} /></button>
        </div>
        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Kategori Surat</label>
            <select
              value={form.letterCategoryId}
              onChange={(e) => setForm((p) => ({ ...p, letterCategoryId: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Surat</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Contoh: Surat Keterangan Usaha"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Deskripsi <span className="text-gray-400">(opsional)</span></label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Deskripsi singkat"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama File Template <span className="text-gray-400">(e.g. Surat Keterangan Usaha.docx)</span></label>
            <input
              type="text"
              value={form.templatePath}
              onChange={(e) => setForm((p) => ({ ...p, templatePath: e.target.value }))}
              placeholder="Nama file di bucket letter-template"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Batal</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-lg transition disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Simpan" : "Tambah"}
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
        <h2 className="text-base font-bold text-gray-900 mb-2">Hapus Jenis Surat</h2>
        <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus <span className="font-semibold text-gray-700">"{name}"</span>? Tindakan ini tidak dapat dibatalkan.</p>
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
export default function JenisSuratPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/letters/categories");
      const json = await res.json();
      if (json.success) setCategories(json.data);
      else setError("Gagal memuat data");
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => { setEditData(null); setModalOpen(true); };
  const handleEdit = (lt, catId) => { setEditData({ ...lt, letterCategoryId: catId }); setModalOpen(true); };
  const handleSave = () => { setModalOpen(false); fetchData(); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/admin/letter-types/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) { setDeleteTarget(null); fetchData(); }
      else { const j = await res.json(); alert(j.message || "Gagal menghapus"); }
    } catch { alert("Gagal terhubung ke server"); }
    finally { setDeleting(false); }
  };

  // Flatten all letter types with their category info
  const allLetterTypes = categories.flatMap((cat) =>
    cat.letterTypes.map((lt) => ({ ...lt, categoryName: cat.name, categoryId: cat.id }))
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jenis Surat</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola jenis surat yang tersedia untuk pengajuan.</p>
        </div>
        <button
          onClick={handleAdd}
          id="admin-add-letter-type"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-xl transition shadow-sm"
        >
          <Plus size={16} />
          Tambah Jenis Surat
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
        ) : allLetterTypes.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-sm text-gray-400">Belum ada jenis surat. Tambahkan sekarang.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Nama Surat</th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Kategori</th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Template</th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {allLetterTypes.map((lt, i) => (
                <tr key={lt.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{lt.name}</p>
                    {lt.description && <p className="text-xs text-gray-400 mt-0.5">{lt.description}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-[#1a2e6f]/10 text-[#1a2e6f]">
                      {lt.categoryName}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {lt.templatePath ? (
                      <span className="text-xs text-gray-500 font-mono truncate max-w-[180px] block">{lt.templatePath}</span>
                    ) : (
                      <span className="text-xs text-gray-300 italic">Tidak ada</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(lt, lt.categoryId)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#1a2e6f] hover:bg-[#1a2e6f]/10 transition"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(lt)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <LetterTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        categories={categories}
        editData={editData}
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
