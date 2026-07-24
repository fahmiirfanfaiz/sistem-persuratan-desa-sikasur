"use client";

import { useState, useEffect } from "react";
import { getStoredUser, apiFetch } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

export default function AdminBerandaPage() {
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [yearDropOpen, setYearDropOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [statsRes, subRes] = await Promise.all([
          apiFetch(`/api/admin/stats?year=${selectedYear}`),
          apiFetch(`/api/admin/submissions?limit=1000`),
        ]);
        const statsJson = await statsRes.json();
        const subJson = await subRes.json();

        if (statsJson.success) setStats(statsJson.data);

        if (subJson.success) {
          const all = subJson.submissions ?? [];
          setSummaryStats({
            total: subJson.total ?? all.length,
            pending: all.filter((s) => s.status === "PENDING").length,
            onProcess: all.filter((s) => s.status === "ON_PROCESS").length,
            completed: all.filter((s) => s.status === "COMPLETED").length,
            rejected: all.filter((s) => s.status === "REJECTED").length,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedYear]);

  const chartData = stats?.data?.map((d, i) => ({
    month: MONTHS[i].slice(0, 3),
    fullMonth: MONTHS[i],
    total: d.count,
  })) ?? [];

  const STAT_CARDS = summaryStats
    ? [
        {
          label: "Total Permohonan",
          value: summaryStats.total,
          color: "text-[#1a2e6f]",
          bg: "bg-[#1a2e6f]/10",
          icon: ClipboardList,
        },
        {
          label: "Menunggu",
          value: summaryStats.pending,
          color: "text-amber-600",
          bg: "bg-amber-50",
          icon: Clock,
        },
        {
          label: "Diproses",
          value: summaryStats.onProcess,
          color: "text-blue-600",
          bg: "bg-blue-50",
          icon: ClipboardList,
        },
        {
          label: "Selesai",
          value: summaryStats.completed,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          icon: CheckCircle2,
        },
        {
          label: "Ditolak",
          value: summaryStats.rejected,
          color: "text-red-500",
          bg: "bg-red-50",
          icon: XCircle,
        },
      ]
    : [];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, Admin 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola permohonan surat yang telah diajukan.
        </p>
      </div>

      {/* Stat Cards */}
      {summaryStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2"
              >
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon size={18} className={card.color} />
                </div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Total Permohonan Surat</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">
              {loading ? "..." : (stats?.total ?? 0)}
            </p>
          </div>

          {/* Year Selector */}
          <div className="relative">
            <button
              onClick={() => setYearDropOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              {selectedYear}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${yearDropOpen ? "rotate-180" : ""}`}
              />
            </button>
            {yearDropOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                {YEAR_OPTIONS.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setSelectedYear(y);
                      setYearDropOpen(false);
                    }}
                    className={`w-full px-5 py-2.5 text-sm text-left hover:bg-gray-50 transition ${
                      y === selectedYear ? "font-semibold text-[#1a2e6f]" : "text-gray-700"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        {loading ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#1a2e6f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barSize={28} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "#f0f4fb" }}
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    const full = chartData.find((d) => d.month === label)?.fullMonth ?? label;
                    return (
                      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
                        <p className="text-xs text-gray-500 mb-1">{full}</p>
                        <p className="text-sm font-bold text-[#1a2e6f]">
                          {payload[0].value} permohonan
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" fill="#F5A623" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
