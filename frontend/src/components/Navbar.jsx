"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, User, LogOut, Bell, History, LayoutDashboard } from "lucide-react";
import { getStoredUser, clearAuth } from "@/lib/api";
import LogoutModal from "./LogoutModal";

/**
 * Shared Navbar component for authenticated pages.
 * Profile Dropdown sesuai desain Figma node 383-960
 * Dilengkapi ikon Riwayat (History) dan Notifikasi (Bell)
 */
export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]); // re-read on navigation to pick up auth changes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutConfirm = () => {
    clearAuth();
    setUser(null);
    setLogoutModalOpen(false);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const isActive = (href) => pathname === href;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
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

          {/* Right — icons + Profile Dropdown */}
          {user ? (
            <div className="flex items-center gap-1">
              {/* Admin Dashboard Button — only for ADMIN role */}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  id="navbar-admin-btn"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    pathname.startsWith("/admin")
                      ? "bg-[#1a2e6f] text-white"
                      : "bg-[#1a2e6f]/10 text-[#1a2e6f] hover:bg-[#1a2e6f] hover:text-white"
                  }`}
                  title="Admin Dashboard"
                >
                  <LayoutDashboard size={15} />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* Notification Bell */}
              <Link
                href="/notifications"
                id="navbar-notifications-btn"
                className={`relative p-2.5 rounded-xl transition ${
                  isActive("/notifications")
                    ? "bg-[#1a2e6f]/10 text-[#1a2e6f]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-[#1a2e6f]"
                }`}
                aria-label="Notifikasi"
                title="Notifikasi"
              >
                <Bell size={20} strokeWidth={1.75} />
              </Link>

              {/* Riwayat Pengajuan */}
              <Link
                href="/history"
                id="navbar-history-btn"
                className={`p-2.5 rounded-xl transition ${
                  isActive("/history")
                    ? "bg-[#1a2e6f]/10 text-[#1a2e6f]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-[#1a2e6f]"
                }`}
                aria-label="Riwayat Pengajuan"
                title="Riwayat Pengajuan"
              >
                <History size={20} strokeWidth={1.75} />
              </Link>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="navbar-profile-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-gray-100 transition"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar — initial-based */}
                  <div className="w-8 h-8 rounded-full bg-[#1a2e6f] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu — Figma 383-960 */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[220px] rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* User info header */}
                    <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span>Profil Pengguna</span>
                        <User size={16} className="text-gray-400 flex-shrink-0" />
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#e53e3e] hover:bg-red-50 transition"
                      >
                        <span>Keluar</span>
                        <LogOut size={16} className="flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
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

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
