"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function EditJenisSuratPage() {
  const { id } = useParams();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [errorInitial, setErrorInitial] = useState("");

  const [form, setForm] = useState({
    letterCategoryId: "",
    name: "",
    description: "",
    templatePath: "",
  });
  const [loadingSave, setLoadingSave] = useState(false);
  const [errorSave, setErrorSave] = useState("");

  useEffect(() => {
    const fetchInit = async () => {
      setLoadingInitial(true);
      try {
        // Fetch categories and letter type detail concurrently
        const [catRes, detailRes] = await Promise.all([
          apiFetch("/api/letters/categories"),
          apiFetch(`/api/admin/letter-types/${id}`),
        ]);

        const catJson = await catRes.json();
        const detailJson = await detailRes.json();

        if (catJson.success && detailJson.success) {
          setCategories(catJson.data);
          const data = detailJson.data;
          setForm({
            letterCategoryId: data.letterCategoryId || (catJson.data[0]?.id ?? ""),
            name: data.name || "",
            description: data.description || "",
            templatePath: data.templatePath || "",
          });
        } else {
          setErrorInitial("Gagal memuat data");
        }
      } catch {
        setErrorInitial("Gagal terhubung ke server");
      } finally {
        setLoadingInitial(false);
      }
    };
    if (id) fetchInit();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorSave("Nama surat wajib diisi");
      return;
    }
    setLoadingSave(true);
    setErrorSave("");
    try {
      const res = await apiFetch(`/api/admin/letter-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorSave(json.message || "Terjadi kesalahan");
        return;
      }
      // Redirect back after success
      router.push("/admin/jenis-surat");
    } catch {
      setErrorSave("Gagal terhubung ke server");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 size={32} className="animate-spin text-[#1a2e6f]" />
      </div>
    );
  }

  if (errorInitial) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <AlertCircle size={40} className="text-red-400 mb-3" />
        <p className="text-sm text-gray-500">{errorInitial}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 text-sm font-semibold text-[#1a2e6f] border border-[#1a2e6f] rounded-lg hover:bg-[#1a2e6f]/5 transition"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.push("/admin/jenis-surat")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2e6f] transition mb-5"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Jenis Surat</h2>

        {errorSave && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errorSave}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Surat</label>
            <select
              value={form.letterCategoryId}
              onChange={(e) => setForm((p) => ({ ...p, letterCategoryId: e.target.value }))}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Surat</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Contoh: Surat Keterangan Usaha"
              className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi <span className="text-gray-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Deskripsi singkat mengenai jenis surat ini"
              className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama File Template <span className="text-gray-400">(e.g. Surat Keterangan Usaha.docx)</span>
            </label>
            <input
              type="text"
              value={form.templatePath}
              onChange={(e) => setForm((p) => ({ ...p, templatePath: e.target.value }))}
              placeholder="Nama file di bucket letter-template"
              className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/jenis-surat")}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loadingSave}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1a2e6f] hover:bg-[#152460] rounded-xl transition shadow-sm disabled:opacity-60"
            >
              {loadingSave && <Loader2 size={16} className="animate-spin" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
