"use client";

import { Murid, Kelas, TahunAjaran } from "@/types";
import { useState } from "react";
import { SaveButton } from "@/components/shared/SaveButton";
import { ToastNotifier } from "@/components/shared/ToastNotifier";

export function PindahKelasModal({ 
  murid, 
  kelasList, 
  activeTahun, 
  onSave, 
  onCancel 
}: { 
  murid: Murid, 
  kelasList: Kelas[], 
  activeTahun: TahunAjaran,
  onSave: (murid: Murid) => void, 
  onCancel: () => void 
}) {
  const [kelasTujuanId, setKelasTujuanId] = useState("");
  const [alasan, setAlasan] = useState("");
  
  const currentYearClasses = kelasList.filter(k => k.tahunId === activeTahun.tahunId && k.kelasId !== murid.kelasId);

  const handleSave = () => {
    if (!kelasTujuanId) return ToastNotifier.error("Pilih kelas tujuan");
    if (!alasan) return ToastNotifier.error("Isi alasan pindah");

    const now = new Date().toISOString();
    const updatedRiwayat = [...murid.riwayatKelas];
    
    // Close current class record
    if (updatedRiwayat.length > 0) {
      updatedRiwayat[updatedRiwayat.length - 1].tanggalKeluar = now;
      updatedRiwayat[updatedRiwayat.length - 1].alasan = `Pindah kelas: ${alasan}`;
    }

    // Open new class record
    updatedRiwayat.push({
      kelasId: kelasTujuanId,
      tahunId: activeTahun.tahunId,
      tanggalMasuk: now,
      tanggalKeluar: null,
      alasan: "pindah_kelas"
    });

    const updatedMurid = {
      ...murid,
      kelasId: kelasTujuanId,
      riwayatKelas: updatedRiwayat
    };

    onSave(updatedMurid);
    ToastNotifier.success(`Berhasil memindah kelas ${murid.nama}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 max-h-screen overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Pindah Kelas: {murid.nama}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kelas Tujuan</label>
            <select value={kelasTujuanId} onChange={e => setKelasTujuanId(e.target.value)} className="w-full border p-2 rounded text-sm">
              <option value="">-- Pilih Kelas --</option>
              {currentYearClasses.map(k => (
                <option key={k.kelasId} value={k.kelasId}>{k.namaKelas}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alasan Pindah</label>
            <textarea value={alasan} onChange={e => setAlasan(e.target.value)} rows={3} className="w-full border p-2 rounded text-sm" placeholder="Kenapa murid ini pindah?"></textarea>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm border rounded hover:bg-slate-50">Batal</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}

export function MutasiModal({ 
  murid, 
  onSave, 
  onCancel 
}: { 
  murid: Murid, 
  onSave: (murid: Murid) => void, 
  onCancel: () => void 
}) {
  const [alasan, setAlasan] = useState("");
  const [tanggal, setTanggal] = useState("");
  
  const handleSave = () => {
    if (!alasan || !tanggal) return ToastNotifier.error("Isi alasan dan tanggal mutasi");

    const updatedRiwayat = [...murid.riwayatKelas];
    if (updatedRiwayat.length > 0) {
      updatedRiwayat[updatedRiwayat.length - 1].tanggalKeluar = new Date(tanggal).toISOString();
      updatedRiwayat[updatedRiwayat.length - 1].alasan = `Mutasi: ${alasan}`;
    }

    const updatedMurid: Murid = {
      ...murid,
      status: "mutasi",
      kelasId: null,
      riwayatKelas: updatedRiwayat
    };

    onSave(updatedMurid);
    ToastNotifier.success(`Berhasil mencatat mutasi ${murid.nama}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-red-600">Mutasi/Keluar: {murid.nama}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Keluar</label>
            <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full border p-2 rounded text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alasan Keluar/Mutasi</label>
            <textarea value={alasan} onChange={e => setAlasan(e.target.value)} rows={3} className="w-full border p-2 rounded text-sm"></textarea>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm border rounded hover:bg-slate-50">Batal</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">Catat Mutasi</button>
        </div>
      </div>
    </div>
  );
}

export function RiwayatTimeline({ murid, kelasList, tahunList, onCancel }: { murid: Murid, kelasList: Kelas[], tahunList: TahunAjaran[], onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-lg font-bold">Riwayat: {murid.nama}</h2>
          <button onClick={onCancel} className="text-slate-400 font-bold">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:w-0.5 before:bg-slate-200">
          {murid.riwayatKelas.map((item, idx) => {
            const kls = kelasList.find(k => k.kelasId === item.kelasId)?.namaKelas || "Unknown";
            const th = tahunList.find(t => t.tahunId === item.tahunId)?.tahun || "";
            return (
              <div key={idx} className="relative pl-12">
                <div className="absolute left-3 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow mt-1"></div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                  <h4 className="font-bold text-blue-700">Kelas {kls} <span className="text-slate-400 text-xs font-normal">({th})</span></h4>
                  <p className="text-xs text-slate-500 mt-1">Masuk: {new Date(item.tanggalMasuk).toLocaleDateString("id-ID")}</p>
                  {item.tanggalKeluar && <p className="text-xs text-slate-500">Keluar: {new Date(item.tanggalKeluar).toLocaleDateString("id-ID")}</p>}
                  <p className="text-xs font-medium text-slate-600 mt-1">Status: {item.alasan}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t text-right">
           <button onClick={onCancel} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded hover:bg-slate-200">Tutup</button>
        </div>
      </div>
    </div>
  );
}
