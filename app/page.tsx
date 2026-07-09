"use client";

import { useAppStore } from "@/store/useAppStore";
import { Users, BookOpen, GraduationCap, School } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { tahunAjaranAktif, kelasAktif, muridAktif } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Selamat datang di Sistem Asesmen Kurikulum Merdeka.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={School}
          title="Tahun Ajaran Aktif" 
          value={tahunAjaranAktif ? `${tahunAjaranAktif.tahun} - SMT ${tahunAjaranAktif.semester}` : "Belum diatur"} 
          link="/pengaturan/tahun-ajaran"
          color="blue"
        />
        <StatCard 
          icon={Users}
          title="Kelas Aktif" 
          value={kelasAktif ? kelasAktif.namaKelas : "Belum dipilih"} 
          link="/pengaturan/kelas"
          color="blue"
        />
        <StatCard 
          icon={GraduationCap}
          title="Murid Fokus" 
          value={muridAktif ? muridAktif.nama : "Belum dipilih"} 
          link="/pengaturan/murid"
          color="emerald"
        />
        <StatCard 
          icon={BookOpen}
          title="Modul & Tujuan" 
          value="Lihat" 
          link="/perencanaan"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Akses Cepat Pengisian Nilai</h2>
          <div className="space-y-3">
            <QuickLink href="/formatif" title="Input Asesmen Formatif" desc="Catatan anekdotal, observasi, dan refleksi murid." />
            <QuickLink href="/kktp" title="Kelola KKTP" desc="Kriteria Ketercapaian Tujuan Pembelajaran." />
            <QuickLink href="/sumatif" title="Input Asesmen Sumatif" desc="Nilai akhir tes tertulis dan proyek akhir." />
            <QuickLink href="/rapor" title="Cetak E-Rapor" desc="Buat laporan capaian kompetensi semester." />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Info Aplikasi</h2>
          <div className="prose prose-sm text-slate-500">
            <p><strong>Merdeka Asesmen</strong> adalah aplikasi pencatatan nilai yang difokuskan pada sinkronisasi lokal dan <em>offline-first</em>. Ini berarti seluruh data yang Anda masukkan disimpan dengan aman di <em>browser</em> (Local Storage).</p>
            <ul>
              <li>Tidak memerlukan internet saat bekerja.</li>
              <li>Sistem auto-save dihapus untuk ketepatan konfirmasi ganda (Confirm-to-Save).</li>
              <li>Selalu pastikan Anda menekan tombol &quot;Simpan&quot;.</li>
            </ul>
            <p className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800">
              Mulai dengan mengatur Tahun Ajaran, menginput Murid, lalu merancang Modul (Tujuan Pembelajaran).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, link, icon: Icon, color }: { title: string, value: string, link: string, icon: any, color: 'blue' | 'emerald' | 'amber' }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <Link href={link} className="block group">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <div className={`p-2 rounded-lg ${colorStyles[color]} transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-lg font-semibold text-slate-900 truncate">{value}</p>
      </div>
    </Link>
  );
}

function QuickLink({ href, title, desc }: { href: string, title: string, desc: string }) {
  return (
    <Link href={href} className="group block p-4 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-slate-50 transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h4>
          <p className="text-sm text-slate-500 mt-1">{desc}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
          <span className="text-slate-400 group-hover:text-blue-600 text-lg font-bold leading-none">→</span>
        </div>
      </div>
    </Link>
  );
}
