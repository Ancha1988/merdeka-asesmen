import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { AlertCircle, CheckCircle2, TrendingUp, Eye, X, FileText } from "lucide-react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";

interface KeputusanTabProps {
  kelasId: string;
}

export function KeputusanTab({ kelasId }: KeputusanTabProps) {
  const { kelas, murid, tp, pengolahanNilai, formatif } = useMasterData();
  
  const [selectedMuridId, setSelectedMuridId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const activeKelas = kelas.find(k => k.kelasId === kelasId);
  const availableMurid = murid.filter(m => m.kelasId === kelasId && m.status === 'aktif');
  const availableTp = tp.filter(t => t.kelasTargetIds.includes(kelasId));

  if (!kelasId) {
    return (
      <div className="p-10 text-center text-slate-500">
        Silakan pilih Kelas terlebih dahulu pada header di atas.
      </div>
    );
  }

  // Agregat seluruh TP yang relevan dengan kelas ini per murid
  const summary = availableMurid.map(m => {
    let tpTuntas = 0;
    let tpBelumTuntas = 0;
    let totalNilai = 0;
    
    availableTp.forEach(t => {
      const p = pengolahanNilai.find(x => x.tpId === t.tpId && x.muridId === m.muridId);
      if (p) {
        const tuntas = p.isTuntas !== undefined ? p.isTuntas : p.nilaiAkhir >= 70;
        if (tuntas) {
          tpTuntas++;
        } else {
          tpBelumTuntas++;
        }
        totalNilai += p.nilaiAkhir;
      }
    });
    
    // total TP that have been processed with nilai. If < availableTp length, some are missing.
    const tpProcessed = tpTuntas + tpBelumTuntas;
    const isLengkap = tpProcessed === availableTp.length && availableTp.length > 0;
    
    // Rekomendasi
    let status = "aman"; // Default aman if not lengkap but nothing failing yet
    if (tpBelumTuntas > 0) status = "remedial_required";
    if (tpBelumTuntas > 2) status = "risiko_tinggal";

    return {
      muridId: m.muridId,
      nama: m.nama,
      nisn: m.nisn,
      tpTuntas,
      tpBelumTuntas,
      tpProcessed,
      isLengkap,
      rataRataGlobal: tpProcessed > 0 ? (totalNilai / tpProcessed).toFixed(1) : "-",
      status
    };
  });

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rekomendasi Naik Kelas</h2>
          <p className="text-slate-500 text-sm">Rangkuman ketuntasan Tujuan Pembelajaran seluruh murid Kelas {activeKelas?.namaKelas}</p>
        </div>
        <Link 
          href="/pengaturan/siswa?tab=bulk" // Route ke module pengaturan bulk update (simulasi)
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" /> Buka Modul Naik Kelas Massal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{summary.filter(s => s.status === 'aman').length}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Murid Aman (Tuntas Semua)</div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{summary.filter(s => s.status === 'remedial_required').length}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Perlu Remedial</div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
             <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{summary.filter(s => s.status === 'risiko_tinggal').length}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Risiko Tidak Naik</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold border-r border-slate-200">Nama Murid</th>
              <th className="px-4 py-3 font-semibold text-center border-r border-slate-200">TP Tuntas (Lulus)</th>
              <th className="px-4 py-3 font-semibold text-center border-r border-slate-200">TP Belum Tuntas</th>
              <th className="px-4 py-3 font-semibold text-center border-r border-slate-200">Rata-rata Global</th>
              <th className="px-4 py-3 font-semibold border-r border-slate-200">Rekomendasi Sistem</th>
              <th className="px-4 py-3 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s, idx) => (
              <tr key={s.muridId} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                <td className="px-4 py-3 border-r border-slate-200">
                  <div className="font-semibold text-slate-800">{s.nama}</div>
                  <div className="text-xs text-slate-500">{s.nisn}</div>
                </td>
                <td className="px-4 py-3 text-center border-r border-slate-200 font-medium text-green-700">
                  {s.tpTuntas}
                </td>
                <td className="px-4 py-3 text-center border-r border-slate-200 font-medium text-red-700">
                  {s.tpBelumTuntas > 0 ? s.tpBelumTuntas : "-"}
                </td>
                <td className="px-4 py-3 text-center border-r border-slate-200 font-bold text-slate-700">
                  {s.rataRataGlobal}
                </td>
                <td className="px-4 py-3 border-r border-slate-200">
                  {s.status === 'aman' && (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Direkomendasikan Naik
                    </span>
                  )}
                  {s.status === 'remedial_required' && (
                    <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5" /> Tuntaskan Remedial
                    </span>
                  )}
                  {s.status === 'risiko_tinggal' && (
                    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5" /> Risiko Tinggal Kelas
                    </span>
                  )}
                  {!s.isLengkap && (
                    <div className="text-[10px] text-slate-500 mt-1 italic">
                      *Data belum lengkap ({s.tpProcessed} dari {availableTp.length} TP)
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedMuridId(s.muridId);
                      setIsDetailOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-medium text-xs transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detail
                  </button>
                </td>
              </tr>
            ))}
            
            {summary.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Belum ada murid di kelas ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog.Root open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4 border-slate-100">
              <div>
                <Dialog.Title className="text-xl font-bold text-slate-800">
                  Detail Pencapaian Murid
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500 mt-1">
                  {murid.find(m => m.muridId === selectedMuridId)?.nama} ({murid.find(m => m.muridId === selectedMuridId)?.nisn})
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            {selectedMuridId && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4" /> Asesmen Sumatif per TP
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                        <tr>
                          <th className="px-4 py-2 font-medium">Tujuan Pembelajaran</th>
                          <th className="px-4 py-2 font-medium text-center">Nilai Akhir</th>
                          <th className="px-4 py-2 font-medium text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {availableTp.map(t => {
                          const p = pengolahanNilai.find(x => x.tpId === t.tpId && x.muridId === selectedMuridId);
                          const isTuntas = p ? (p.isTuntas !== undefined ? p.isTuntas : p.nilaiAkhir >= 70) : false;
                          return (
                            <tr key={t.tpId} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-2">
                                <div className="font-medium text-slate-800 line-clamp-2" title={t.kompetensi + " " + t.lingkupMateri}>
                                  {t.kompetensi} {t.lingkupMateri}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-center font-semibold text-slate-700">
                                {p ? p.nilaiAkhir : "-"}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {p ? (
                                  <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${isTuntas ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {isTuntas ? 'Tuntas' : 'Belum Tuntas'}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs italic">Kosong</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4" /> Catatan Asesmen Formatif
                  </h3>
                  <div className="space-y-3">
                    {formatif.filter(f => f.muridId === selectedMuridId && availableTp.some(t => t.tpId === f.tpId)).length > 0 ? (
                      formatif.filter(f => f.muridId === selectedMuridId && availableTp.some(t => t.tpId === f.tpId)).map(f => {
                        const targetTp = availableTp.find(t => t.tpId === f.tpId);
                        return (
                          <div key={f.asesmenId} className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{f.jenis}</div>
                              <div className="text-xs text-slate-400">{f.tanggal}</div>
                            </div>
                            <div className="text-sm font-medium text-slate-700 mb-1">
                              TP: {targetTp ? `${targetTp.kompetensi} ${targetTp.lingkupMateri}` : 'Unknown TP'}
                            </div>
                            <div className="text-sm text-slate-600 bg-white p-2 border border-slate-100 rounded">
                              {f.catatan || "Tidak ada catatan."}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center p-6 border border-dashed border-slate-200 rounded-lg text-slate-500 text-sm">
                        Belum ada data asesmen formatif untuk siswa ini di kelas ini.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
