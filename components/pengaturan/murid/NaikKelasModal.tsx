"use client";

import { useState } from "react";
import { Murid, Kelas, TahunAjaran } from "@/types";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";

export function NaikKelasModal({ 
  muridList, 
  kelasList, 
  tahunAjaranList, 
  activeTahun, 
  onSave, 
  onCancel 
}: { 
  muridList: Murid[], 
  kelasList: Kelas[], 
  tahunAjaranList: TahunAjaran[],
  activeTahun: TahunAjaran,
  onSave: (updatedMuridList: Murid[]) => void, 
  onCancel: () => void 
}) {
  const [targetTahunId, setTargetTahunId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const activeMurid = muridList.filter(m => m.status === 'aktif' && m.kelasId);
  const sourceClasses = kelasList.filter(k => k.tahunId === activeTahun.tahunId);
  
  // Mapping current class ID to target class ID in target year
  const [classMapping, setClassMapping] = useState<Record<string, string>>({});
  const [selectedMuridIds, setSelectedMuridIds] = useState<Set<string>>(new Set(activeMurid.map(m => m.muridId)));

  const targetClasses = kelasList.filter(k => k.tahunId === targetTahunId);

  const handleToggleMurid = (muridId: string) => {
    const newSet = new Set(selectedMuridIds);
    if (newSet.has(muridId)) newSet.delete(muridId);
    else newSet.add(muridId);
    setSelectedMuridIds(newSet);
  };

  const processNaikKelas = () => {
    if (!targetTahunId) {
      ToastNotifier.error("Pilih Tahun Ajaran Tujuan");
      return;
    }
    
    // Validasi mapping kelas
    const muridToProcess = activeMurid.filter(m => selectedMuridIds.has(m.muridId));
    if (muridToProcess.length === 0) {
      ToastNotifier.error("Belum ada murid yang dipilih");
      return;
    }

    let hasUnmapped = false;
    for (const m of muridToProcess) {
       if (m.kelasId && !classMapping[m.kelasId]) {
         hasUnmapped = true;
         break;
       }
    }

    if (hasUnmapped) {
       ToastNotifier.error("Pastikan semua kelas asal memiliki tujuan pemetaan kelas!");
       return;
    }

    setIsConfirmOpen(true);
  };

  const executeProcess = () => {
    setIsConfirmOpen(false);
    const now = new Date().toISOString();
    let updatedMurid = [...muridList];
    let count = 0;

    for (let i = 0; i < updatedMurid.length; i++) {
       const m = updatedMurid[i];
       if (selectedMuridIds.has(m.muridId) && m.kelasId) {
         const targetKelasId = classMapping[m.kelasId];
         if (targetKelasId) {
           const riwayat = [...m.riwayatKelas];
           
           if (riwayat.length > 0) {
             riwayat[riwayat.length - 1].tanggalKeluar = now;
             riwayat[riwayat.length - 1].alasan = "naik_kelas";
           }

           riwayat.push({
             kelasId: targetKelasId,
             tahunId: targetTahunId,
             tanggalMasuk: now,
             tanggalKeluar: null,
             alasan: "naik_kelas"
           });

           updatedMurid[i] = {
             ...m,
             kelasId: targetKelasId,
             riwayatKelas: riwayat
           };
           count++;
         }
       }
    }

    onSave(updatedMurid);
    ToastNotifier.success(`Berhasil memproses naik kelas untuk ${count} murid.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2 className="text-lg font-bold">Proses Naik Kelas Massal</h2>
          <button onClick={onCancel} className="text-slate-400 font-bold">&times;</button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">1. Pilih Tahun Ajaran Tujuan</label>
              <select value={targetTahunId} onChange={e => setTargetTahunId(e.target.value)} className="w-full sm:w-1/2 px-3 py-2 border border-blue-300 rounded focus:outline-none text-sm bg-white">
                <option value="">-- Pilih Tahun Ajaran --</option>
                {tahunAjaranList.filter(t => t.tahunId !== activeTahun.tahunId).map(t => (
                  <option key={t.tahunId} value={t.tahunId}>{t.tahun} - SMT {t.semester}</option>
                ))}
              </select>
            </div>
          </div>

          {targetTahunId && (
            <div>
              <label className="block text-sm font-semibold mb-3">2. Petakan Kelas & Pilih Murid</label>
              <div className="space-y-6">
                {sourceClasses.map(kls => {
                  const muridInClass = activeMurid.filter(m => m.kelasId === kls.kelasId);
                  if (muridInClass.length === 0) return null;
                  
                  return (
                    <div key={kls.kelasId} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 p-3 border-b border-slate-200 flex sm:items-center flex-col sm:flex-row gap-4 justify-between">
                        <div className="font-semibold text-sm w-48 shrink-0">
                          Dari Kelas: <span className="text-blue-600">{kls.namaKelas}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm text-slate-500">→ Lanjut Ke: </span>
                          <select 
                            value={classMapping[kls.kelasId] || ""}
                            onChange={(e) => setClassMapping({...classMapping, [kls.kelasId]: e.target.value})}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                          >
                            <option value="">-- Pilih Kelas Tujuan --</option>
                            {targetClasses.map(tk => (
                              <option key={tk.kelasId} value={tk.kelasId}>{tk.namaKelas}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="p-3 max-h-48 overflow-y-auto bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {muridInClass.map(m => (
                          <label key={m.muridId} className="flex items-center gap-2 cursor-pointer border border-slate-100 p-2 rounded hover:bg-slate-50 text-sm">
                            <input 
                              type="checkbox" 
                              checked={selectedMuridIds.has(m.muridId)} 
                              onChange={() => handleToggleMurid(m.muridId)} 
                              className="rounded text-blue-600"
                            />
                            <span className="truncate">{m.nama}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl bg-slate-50">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium border border-slate-300 rounded text-slate-700 bg-white">Batal</button>
          <button onClick={processNaikKelas} className="px-4 py-2 text-sm font-medium bg-blue-600 rounded text-white hover:bg-blue-700">Proses Naik Kelas</button>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Proses Naik Kelas?"
        description="Aksi ini akan memperbarui kelas murid dan mencatat riwayat kenaikan secara massal."
        onConfirm={executeProcess}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
