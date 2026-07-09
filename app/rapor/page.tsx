"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useMasterData } from "@/hooks/useMasterData";
import { useRapor } from "@/hooks/useRapor";
import { Rapor, RaporDeskripsiMapel, RaporProfilDimensi } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Printer, Save, CheckCircle, FileText } from "lucide-react";
import { ToastNotifier } from "@/components/shared/ToastNotifier";

const DIMENSI_LIST = [
  { id: "D1", nama: "Beriman" },
  { id: "D2", nama: "Berkebhinekaan Global" },
  { id: "D3", nama: "Bergotong Royong" },
  { id: "D4", nama: "Mandiri" },
  { id: "D5", nama: "Kreatif" },
  { id: "D6", nama: "Bernalar Kritis" },
  { id: "D7", nama: "Komunikatif" },
  { id: "D8", nama: "Entrepreneurial" },
];

export default function RaporPage() {
  const { tahunAjaranAktif } = useAppStore();
  const { sekolah, kelas, murid, tp, pengolahanNilai, guru, isLoading: isMasterLoading } = useMasterData();
  const { raporList, updateRapor, isLoading: isRaporLoading } = useRapor();

  const [selectedKelasId, setSelectedKelasId] = useState("");
  const [selectedMuridId, setSelectedMuridId] = useState("");
  const [isEditingDeskripsi, setIsEditingDeskripsi] = useState(false);
  const [tempDeskripsi, setTempDeskripsi] = useState("");
  
  const [isMounted, setIsMounted] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  const availableKelas = kelas.filter(k => k.tahunId === tahunAjaranAktif?.tahunId);
  const selectedKelas = kelas.find(k => k.kelasId === selectedKelasId);
  const availableMurid = murid.filter(m => m.kelasId === selectedKelasId && m.status === "aktif")
                              .sort((a, b) => a.nama.localeCompare(b.nama));
                              
  const selectedMurid = murid.find(m => m.muridId === selectedMuridId);
  const waliKelas = guru.find(g => g.uid === selectedKelas?.waliKelasId);
  const activeSekolah = sekolah; // Assumes non-array or array[0]

  // Filter TP & Pengolahan matching this class
  const classTps = tp.filter(t => t.kelasTargetIds.includes(selectedKelasId));
  const muridPengolahan = pengolahanNilai.filter(pn => pn.muridId === selectedMuridId && classTps.some(t => t.tpId === pn.tpId));

  // Determine current Rapor
  const currentRaporId = `rap-${tahunAjaranAktif?.tahunId}-${tahunAjaranAktif?.semester}-${selectedKelasId}-${selectedMuridId}`;
  let initialRapor = raporList.find(r => r.raporId === currentRaporId);

  // Default Generate Logic 
  const deskripsiAuto = () => {
    if (muridPengolahan.length === 0) return { NLG: "Belum ada data nilai.", T: "-", R: "-", NilaiAkhir: 0 };
    
    // Sort by nilaiAkhir desc
    const sorted = [...muridPengolahan].sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
    const tertinggi = sorted[0];
    const terendah = sorted[sorted.length - 1];
    
    const tpTinggi = classTps.find(t => t.tpId === tertinggi.tpId);
    const tpRendah = classTps.find(t => t.tpId === terendah.tpId);
    
    const namaTinggi = tpTinggi ? tpTinggi.kompetensi : "Materi T";
    const namaRendah = tpRendah ? tpRendah.kompetensi : "Materi R";
    
    const avg = muridPengolahan.reduce((sum, item) => sum + item.nilaiAkhir, 0) / muridPengolahan.length;

    const NLG = `Ananda ${selectedMurid?.nama || ""} menunjukkan penguasaan sangat baik dalam ${namaTinggi}. Perlu mendapat pendampingan untuk meningkatkan ${namaRendah}.`;
    
    return {
      NLG,
      T: namaTinggi,
      R: namaRendah,
      NilaiAkhir: Math.round(avg * 100) / 100
    };
  };

  const autoData = deskripsiAuto();

  // Prepare radar chart data
  const radarData = useMemo(() => {
    return DIMENSI_LIST.map(d => {
      // Find TPs that have this dimensi
      const tpsWithDimensi = classTps.filter(t => t.dimensiIds.includes(d.id));
      if (tpsWithDimensi.length === 0) return { subject: d.nama, A: 0, fullMark: 100 };
      
      // Get avg nilaiAkhir for these TPs
      const pns = muridPengolahan.filter(pn => tpsWithDimensi.some(t => t.tpId === pn.tpId));
      if (pns.length === 0) return { subject: d.nama, A: 0, fullMark: 100 };
      
      const avg = pns.reduce((sum, item) => sum + item.nilaiAkhir, 0) / pns.length;
      return { subject: d.nama, A: Math.round(avg), fullMark: 100 };
    });
  }, [classTps, muridPengolahan]);

  // Prepare line chart data
  const lineData = useMemo(() => {
    return classTps.sort((a, b) => a.urutan - b.urutan).map((t, idx) => {
      const pn = muridPengolahan.find(p => p.tpId === t.tpId);
      return {
        name: `TP ${idx + 1}`,
        Nilai: pn ? pn.nilaiAkhir : null,
      };
    });
  }, [classTps, muridPengolahan]);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  if (!isMounted || isMasterLoading || isRaporLoading) {
    return <div className="p-6">Memuat data rapor...</div>;
  }

  if (!tahunAjaranAktif) {
    return <div className="p-6">Harap aktifkan Tahun Ajaran di Pengaturan terlebih dahulu.</div>;
  }

  // Active Deskripsi
  const activeDeskripsi = initialRapor?.deskripsiMapel[0]?.deskripsiNlg || autoData.NLG;

  const handleCreateDraft = (status: "draft" | "valid" | "dicetak") => {
    const r: Rapor = {
      raporId: currentRaporId,
      muridId: selectedMuridId,
      kelasId: selectedKelasId,
      tahunId: tahunAjaranAktif.tahunId,
      semester: tahunAjaranAktif.semester,
      tanggalCetak: new Date().toISOString().split("T")[0],
      status: status,
      deskripsiMapel: [
        {
          mapelId: "all-subject",
          kompetensiTertinggi: autoData.T,
          kompetensiMeningkat: autoData.R,
          deskripsiNlg: tempDeskripsi || activeDeskripsi,
          saranOrtu: "Mohon terus dampingi ananda belajar di rumah.",
          nilaiAkhir: autoData.NilaiAkhir
        }
      ],
      profilDimensi: []
    };
    updateRapor(r);
    ToastNotifier.success(`Rapor berhasil disimpan sebagai ${status}`);
    setIsEditingDeskripsi(false);
  };

  const handlePrint = () => {
    window.print();
    if (initialRapor && initialRapor.status !== "dicetak") {
      updateRapor({ ...initialRapor, status: "dicetak", tanggalCetak: new Date().toISOString().split("T")[0] });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-800">E-Rapor & Cetak</h1>
        <p className="text-sm text-slate-500">Generate dan cetak laporan hasil belajar siswa.</p>
      </div>

      <div className="print:hidden bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Kelas</label>
          <select
            className="w-48 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedKelasId}
            onChange={e => { setSelectedKelasId(e.target.value); setSelectedMuridId(""); }}
          >
            <option value="">-- Pilih Kelas --</option>
            {availableKelas.map(k => (
              <option key={k.kelasId} value={k.kelasId}>{k.namaKelas}</option>
            ))}
          </select>
        </div>
        {selectedKelasId && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Siswa</label>
            <select
              className="w-64 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMuridId}
              onChange={e => setSelectedMuridId(e.target.value)}
            >
              <option value="">-- Pilih Siswa --</option>
              {availableMurid.map(m => (
                <option key={m.muridId} value={m.muridId}>[{m.nisn}] {m.nama} - {m.jenisKelamin}</option>
              ))}
            </select>
          </div>
        )}

        {selectedMuridId && (
          <div className="flex gap-2 ml-auto">
             <button
                onClick={() => handleCreateDraft("draft")}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 flex items-center gap-2"
             >
                <Save className="w-4 h-4" /> Simpan Draft
             </button>
             <button
                onClick={() => handleCreateDraft("valid")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 flex items-center gap-2"
             >
                <CheckCircle className="w-4 h-4" /> Validasi Rapot
             </button>
             <button
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 flex items-center gap-2"
             >
                <Printer className="w-4 h-4" /> Cetak / PDF
             </button>
          </div>
        )}
      </div>

      {/* ERROR / WARNING MSG */}
      {selectedMuridId && (!activeSekolah || Object.keys(activeSekolah).length === 0) && (
        <div className="print:hidden p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          Perhatian: Data Institusi Sekolah belum diisi di Pengaturan. Cetak rapor mungkin tidak sempurna.
        </div>
      )}

      {/* PRINTABLE AREA */}
      {selectedMuridId && selectedMurid && selectedKelas && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 print:shadow-none print:border-none print:rounded-none">
          <div className="p-8 sm:p-12 space-y-8" ref={printRef}>
            
            {/* KOP SURAT */}
            <div className="flex items-center justify-center gap-6 border-b-4 border-slate-800 pb-6 mb-8 text-center">
               <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-300 overflow-hidden">
                 {activeSekolah?.logoUrl ? <img src={activeSekolah.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-slate-400 font-bold text-xs leading-tight">LOGO<br/>SEKOLAH</span>}
               </div>
               <div>
                  <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-900">{activeSekolah?.nama || "NAMA SEKOLAH BELUM DIATUR"}</h2>
                  <p className="text-sm font-semibold text-slate-700 mt-1">NPSN: {activeSekolah?.npsn || "-"}</p>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">{activeSekolah?.alamat || "Alamat sekolah belum diatur."}</p>
               </div>
            </div>

            {/* IDENTITAS */}
            <div className="flex justify-between items-start text-sm">
               <div className="space-y-2">
                 <div className="flex"><span className="w-32 font-semibold">Nama Peserta Didik</span> <span className="mr-2">:</span> <strong>{selectedMurid.nama}</strong></div>
                 <div className="flex"><span className="w-32 font-semibold">NISN</span> <span className="mr-2">:</span> <span>{selectedMurid.nisn}</span></div>
               </div>
               <div className="space-y-2">
                 <div className="flex"><span className="w-32 font-semibold">Kelas</span> <span className="mr-2">:</span> <span>{selectedKelas.namaKelas} (Fase {selectedKelas.fase})</span></div>
                 <div className="flex"><span className="w-32 font-semibold">Tahun Ajaran</span> <span className="mr-2">:</span> <span>{tahunAjaranAktif.tahun} - SMT {tahunAjaranAktif.semester}</span></div>
               </div>
            </div>

            <hr className="border-slate-300 border-dashed" />

            {/* BODY RAPOR */}
            <div className="space-y-8">
               
               {/* 1. NILAI AKHIR */}
               <div>
                  <h3 className="font-bold text-lg mb-4 text-slate-800 border-l-4 border-blue-600 pl-3">A. Capaian Akademik</h3>
                  <table className="w-full border-collapse border border-slate-800 text-sm">
                    <thead>
                       <tr className="bg-slate-100 font-bold text-center">
                          <td className="border border-slate-800 p-2 w-12">No</td>
                          <td className="border border-slate-800 p-2">Mata Pelajaran</td>
                          <td className="border border-slate-800 p-2 w-32">Nilai Akhir</td>
                       </tr>
                    </thead>
                    <tbody>
                       <tr>
                          <td className="border border-slate-800 p-2 text-center">1</td>
                          <td className="border border-slate-800 p-2 font-medium">Pembelajaran Inti (Akumulasi TP)</td>
                          <td className="border border-slate-800 p-2 text-center font-bold text-lg">{autoData.NilaiAkhir}</td>
                       </tr>
                    </tbody>
                  </table>
               </div>

               {/* 2. DESKRIPSI CAPAIAN */}
               <div>
                  <div className="flex justify-between items-center mb-4 border-l-4 border-blue-600 pl-3">
                     <h3 className="font-bold text-lg text-slate-800">B. Deskripsi Kompetensi</h3>
                     {!isEditingDeskripsi && (
                       <button onClick={() => { setTempDeskripsi(activeDeskripsi); setIsEditingDeskripsi(true); }} className="print:hidden text-xs text-blue-600 hover:underline flex items-center gap-1"><FileText className="w-3 h-3"/> Edit Deskripsi</button>
                     )}
                  </div>
                  
                  {isEditingDeskripsi ? (
                    <div className="space-y-3 print:hidden">
                       <textarea 
                          rows={4}
                          value={tempDeskripsi}
                          onChange={(e) => setTempDeskripsi(e.target.value)}
                          className="w-full p-3 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                       />
                       <div className="flex gap-2 justify-end">
                         <button onClick={() => setIsEditingDeskripsi(false)} className="text-sm px-3 py-1 border rounded text-slate-600 hover:bg-slate-50">Batal</button>
                         <button onClick={() => { handleCreateDraft(initialRapor?.status || "draft"); }} className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan Detail</button>
                       </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 italic text-sm text-slate-700 leading-relaxed min-h-[5rem]">
                       &quot;{activeDeskripsi}&quot;
                    </div>
                  )}
               </div>

               {/* 3. VISUALISASI */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 break-inside-avoid">
                  <div>
                    <h4 className="font-bold text-sm mb-4 text-center text-slate-600 uppercase tracking-wider">Perkembangan Nilai per TP</h4>
                    <div className="h-64 border border-slate-200 bg-white rounded-lg p-2">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={lineData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                           <XAxis dataKey="name" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                           <YAxis domain={[0, 100]} fontSize={11} axisLine={false} tickLine={false} />
                           <RechartsTooltip cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}} contentStyle={{fontSize: "12px", borderRadius: "8px"}} />
                           <Line type="monotone" dataKey="Nilai" stroke="#2563eb" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                         </LineChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-4 text-center text-slate-600 uppercase tracking-wider">8 Dimensi Profil (Index)</h4>
                    <div className="h-64 border border-slate-200 bg-white rounded-lg p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" fontSize={9} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fontSize: 9}} />
                          <Radar name="Penguasaan" dataKey="A" stroke="#059669" fill="#10b981" fillOpacity={0.4} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
               </div>

               {/* 4. KEHADIRAN / CATATAN (OPTIONAL) */}
               <div className="break-inside-avoid">
                  <h3 className="font-bold text-lg mb-4 text-slate-800 border-l-4 border-blue-600 pl-3">C. Saran Orang Tua</h3>
                  <div className="p-4 border border-slate-300 text-sm leading-relaxed">
                     <p>{initialRapor?.deskripsiMapel[0]?.saranOrtu || "Mohon terus libatkan diri dalam perkembangan ananda di rumah, serta pastikan ananda cukup istirahat."}</p>
                  </div>
               </div>

            </div>

             {/* TANDA TANGAN */}
             <div className="mt-16 pt-8 break-inside-avoid">
                <div className="flex justify-between px-10 text-sm">
                   <div className="text-center">
                      <p className="mb-20">Mengetahui,<br/>Kepala Sekolah</p>
                      <p className="font-bold underline decoration-slate-400 underline-offset-4">{activeSekolah?.kepsek || "_____________________"}</p>
                      <p>NIP. {activeSekolah?.nipKepsek || "-"}</p>
                   </div>
                   <div className="text-center">
                      <p className="mb-20">Dicetak Tanggal: {initialRapor?.tanggalCetak || new Date().toISOString().split("T")[0]}<br/>Wali Kelas</p>
                      <p className="font-bold underline decoration-slate-400 underline-offset-4">{waliKelas?.nama || "_____________________"}</p>
                      <p>NIP. {waliKelas?.nip || "-"}</p>
                   </div>
                </div>
             </div>
             
             {initialRapor?.status && (
               <div className="mt-12 text-center text-xs text-slate-400 print:block hidden uppercase tracking-[0.2em] font-semibold">
                 DOKUMEN VALID DENGAN STATUS: {initialRapor.status} | TRACE: {initialRapor.raporId}
               </div>
             )}

          </div>
        </div>
      )}
      
      {/* CSS untuk print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
             background: white !important;
          }
          aside, header, nav, .print\\:hidden {
            display: none !important;
          }
          main { 
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}} />
    </div>
  );
}
