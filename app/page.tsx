"use client";

import { useMasterData } from "@/hooks/useMasterData";
import { BookOpen, Users, ClipboardList, Award } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { tp, kktp, murid, kelas } = useMasterData();

  const stats = [
    { title: "Tujuan Pembelajaran", value: tp.length, icon: BookOpen, color: "bg-blue-100 text-blue-600", link: "/perencanaan" },
    { title: "KKTP Dibuat", value: kktp.length, icon: ClipboardList, color: "bg-indigo-100 text-indigo-600", link: "/kktp" },
    { title: "Total Murid", value: murid.length, icon: Users, color: "bg-green-100 text-green-600", link: "/pengaturan/murid" },
    { title: "Kelas Aktif", value: kelas.filter(k => k.isActive).length, icon: Award, color: "bg-amber-100 text-amber-600", link: "/pengaturan/kelas" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Selamat datang di aplikasi Merdeka Asesmen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link key={idx} href={stat.link} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Mulai Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/perencanaan" className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
            <h3 className="font-medium text-blue-900">1. Susun TP & ATP</h3>
            <p className="text-sm text-slate-500 mt-1">Buat Tujuan Pembelajaran dan alur materi.</p>
          </Link>
          <Link href="/kktp" className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
            <h3 className="font-medium text-indigo-900">2. Tentukan KKTP</h3>
            <p className="text-sm text-slate-500 mt-1">Pilih metode penilaian (Deskripsi, Rubrik, Interval, Persentase).</p>
          </Link>
          <Link href="/formatif" className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
            <h3 className="font-medium text-emerald-900">3. Lakukan Asesmen</h3>
            <p className="text-sm text-slate-500 mt-1">Input nilai formatif atau sumatif murid secara berkala.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
