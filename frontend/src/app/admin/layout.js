"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { getStoredUser, clearAuth } from "@/lib/api";
import LogoutModal from "@/components/LogoutModal";

const NAV_ITEMS = [
  { href: "/admin", label: "Beranda", icon: LayoutDashboard, exact: true },
  { href: "/admin/jenis-surat", label: "Jenis Surat", icon: FileText },
  { href: "/admin/permohonan", label: "Permohonan Surat", icon: ClipboardList },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored || stored.role !== "ADMIN") {
      router.replace("/login");
      return;
    }
    setUser(stored);
    setAuthChecked(true);
  }, []); // run once on mount — localStorage is available client-side

  const handleLogout = () => {
    clearAuth();
    setLogoutOpen(false);
    router.push("/");
    router.refresh();
  };

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };


  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
        <div className="w-8 h-8 border-2 border-[#1a2e6f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f5f6fa] font-sans">
      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-[200px] bg-white border-r border-gray-100 shadow-sm z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3">
          <Image
            src="/images/logo-pemalang.svg"
            alt="Logo"
            width={28}
            height={38}
            className="object-contain flex-shrink-0"
          />
          <span className="text-[10px] font-bold text-[#1a2e6f] uppercase leading-tight">
            Sistem Persuratan Digital
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#1a2e6f] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#1a2e6f]"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            id="admin-sidebar-logout"
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 shadow-sm h-14 flex items-center px-5 gap-4 sticky top-0 z-20">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-2 text-xs text-gray-400 min-w-0">
            <Link href="/admin" className="hover:text-[#1a2e6f] transition flex-shrink-0">
              Beranda
            </Link>
            {pathname !== "/admin" && (
              <>
                <span className="flex-shrink-0">›</span>
                <span className="text-gray-700 truncate">
                  {NAV_ITEMS.find((n) => pathname.startsWith(n.href) && !n.exact)
                    ?.label ?? "Detail"}
                </span>
              </>
            )}
          </div>

          {/* Right: Avatar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#1a2e6f] text-white text-xs font-bold flex items-center justify-center">
              {user.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
