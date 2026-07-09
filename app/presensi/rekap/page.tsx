"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useMasterData } from "@/hooks/useMasterData";
import { usePresensi } from "@/hooks/usePresensi";

export default function RekapPresensiPage() {
  const { tahunAjaranAktif } = useAppStore();
  const { kelas, murid, isLoading: isMasterLoading } = useMasterData();
  const { presensiData, isLoading: isPresensiLoading } = usePresensi();

  const [selectedKelasId, setSelectedKelasId] = useState("");
  // default to current month YYYY-MM
  const [selectedBulan, setSelectedBulan] = useState(new Date().toISOString().substring(0, 7));

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isMasterLoading || isPresensiLoading) return <div className="p-6">Memuat data...</div>;
  if (!tahunAjaranAktif) return <div className="p-6">Harap aktifkan Tahun Ajaran di Pengaturan.</div>;

  const availableKelas = kelas.filter(k => k.tahunId === tahunAjaranAktif.tahunId);

  // Filter Presensi Data for the selected class and month
  const presensiBulanIni = presensiData.filter(p => 
    p.tahunId === tahunAjaranAktif.tahunId && 
    p.kelasId === selectedKelasId && 
    p.tanggal.startsWith(selectedBulan)
  );

  // Get active murids for this class
  const targetMurids = murid
    .filter(m => m.kelasId === selectedKelasId && m.status === "aktif")
    .sort((a, b) => a.nama.localeCompare(b.nama));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Rekap Presensi Harian</h1>
        <p className="text-sm text-slate-500">Melihat daftar kehadiran siswa per bulan.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Kelas</label>
          <select
            className="w-48 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedKelasId}
            onChange={e => setSelectedKelasId(e.target.value)}
          >
            <option value="">-- Pilih Kelas --</option>
            {availableKelas.map(k => (
              <option key={k.kelasId} value={k.kelasId}>{k.namaKelas}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bulan</label>
          <input
            type="month"
            className="w-40 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedBulan}
            onChange={e => setSelectedBulan(e.target.value)}
          />
        </div>
      </div>

      {selectedKelasId && targetMurids.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3 text-center">Hadir</th>
                  <th className="px-4 py-3 text-center">Sakit</th>
                  <th className="px-4 py-3 text-center">Izin</th>
                  <th className="px-4 py-3 text-center">Alpa</th>
                  <th className="px-4 py-3 text-center">Bolos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {targetMurids.map((m, idx) => {
                  let hadir = 0;
                  let sakit = 0;
                  let izin = 0;
                  let alpa = 0;
                  let bolos = 0;

                  presensiBulanIni.forEach(ph => {
                    const mp = ph.muridPresensi.find((x: any) => x.muridId === m.muridId);
                    if (mp) {
                      if (mp.status === "HADIR") hadir++;
                      else if (mp.status === "SAKIT") sakit++;
                      else if (mp.status === "IZIN") izin++;
                      else if (mp.status === "ALPA") alpa++;
                      else if (mp.status === "BOLOS") bolos++;
                    }
                  });

                  return (
                    <tr key={m.muridId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-center text-sm text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{m.nama}</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-green-600">{hadir || "-"}</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-yellow-600">{sakit || "-"}</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-blue-600">{izin || "-"}</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-red-600">{alpa || "-"}</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-red-900">{bolos || "-"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
