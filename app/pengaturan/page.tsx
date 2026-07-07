"use client";

import { useMasterData } from "@/hooks/useMasterData";
import { School, Calendar, Users, GraduationCap, UserCircle } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function PengaturanDashboard() {
  const { sekolah, tahunAjaran, kelas, murid, guru, isLoading } = useMasterData();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const activeTahunAjaran = tahunAjaran.find(ta => ta.isActive);
  const activeMurid = murid.filter(m => m.status === 'aktif');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
        <p className="text-slate-500 mt-1">Kelola data master dan konfigurasi aplikasi Merdeka Asesmen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          icon={School} 
          title="Sekolah" 
          value={sekolah?.nama || "Belum diset"}
          link="/pengaturan/sekolah"
        />
        <StatCard 
          icon={Calendar} 
          title="T.A. Aktif" 
          value={activeTahunAjaran ? `${activeTahunAjaran.tahun} - SMT ${activeTahunAjaran.semester}` : "Belum ada"}
          link="/pengaturan/tahun-ajaran"
        />
        <StatCard 
          icon={Users} 
          title="Daftar Kelas" 
          value={`${kelas.length} Kelas`}
          link="/pengaturan/kelas"
        />
        <StatCard 
          icon={GraduationCap} 
          title="Murid Aktif" 
          value={`${activeMurid.length} Murid`}
          link="/pengaturan/murid"
        />
        <StatCard 
          icon={UserCircle} 
          title="Daftar Guru" 
          value={`${guru.length} Guru`}
          link="/pengaturan/guru"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, link, icon: Icon }: { title: string, value: string, link: string, icon: any }) {
  return (
    <Link href={link} className="block group">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        </div>
        <p className="text-lg font-semibold text-slate-900 truncate" title={value}>{value}</p>
      </div>
    </Link>
  );
}
