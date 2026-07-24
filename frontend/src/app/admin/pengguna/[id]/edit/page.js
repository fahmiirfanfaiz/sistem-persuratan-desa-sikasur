"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function EditPenggunaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [errorInitial, setErrorInitial] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "USER",
    isActive: true,
    password: "",
  });
  const [loadingSave, setLoadingSave] = useState(false);
  const [errorSave, setErrorSave] = useState("");

  useEffect(() => {
    const fetchInit = async () => {
      setLoadingInitial(true);
      try {
        const res = await apiFetch(`/api/admin/users/${id}`);
        const json = await res.json();
        if (json.success) {
          const data = json.data;
          setForm({
            name: data.name ?? "",
            email: data.email ?? "",
            phoneNumber: data.phoneNumber ?? "",
            address: data.address ?? "",
            role: data.role ?? "USER",
            isActive: data.isActive ?? true,
            password: "",
          });
        } else {
          setErrorInitial("Gagal memuat data pengguna");
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
    setLoadingSave(true);
    setErrorSave("");
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorSave(json.message || "Terjadi kesalahan");
        return;
      }
      router.push("/admin/pengguna");
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
      <button
        onClick={() => router.push("/admin/pengguna")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2e6f] transition mb-5"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Pengguna</h2>

        {errorSave && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errorSave}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">No Telepon</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password Baru <span className="text-gray-400">(kosongkan jika tidak diubah)</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2e6f]/20 focus:border-[#1a2e6f]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Akun</label>
              <div className="flex items-center gap-3 h-11">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    form.isActive ? "bg-[#1a2e6f]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      form.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium ${
                    form.isActive ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {form.isActive ? "Aktif" : "Non-aktif"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/pengguna")}
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
