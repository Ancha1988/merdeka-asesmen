"use client";

import { useState } from "react";
import { CloudUpload, X } from "lucide-react";
import { ToastNotifier } from "./ToastNotifier";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { loadFromLocal } from "@/lib/storage";

export function FirebaseSync() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [syncOptions, setSyncOptions] = useState({
    master: true,
    perencanaan: true,
    kktp: true,
    formatif: true,
    sumatif: true,
    rapor: true,
  });

  const handleCheckboxChange = (key: keyof typeof syncOptions) => {
    setSyncOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      // Simulate real delay
      await new Promise(res => setTimeout(res, 1000));
      
      const payload: Record<string, any> = {};
      
      if (syncOptions.master) {
        payload.sekolah = loadFromLocal("merdeka_sekolah");
        payload.tahunAjaran = loadFromLocal("merdeka_tahunAjaran");
        payload.kelas = loadFromLocal("merdeka_kelas");
        payload.murid = loadFromLocal("merdeka_murid");
        payload.guru = loadFromLocal("merdeka_guru");
      }
      if (syncOptions.perencanaan) {
        payload.tp = loadFromLocal("merdeka_tp");
      }
      if (syncOptions.kktp) {
        payload.kktp = loadFromLocal("merdeka_kktp");
      }
      if (syncOptions.formatif) {
        payload.formatif = loadFromLocal("merdeka_formatif");
      }
      if (syncOptions.sumatif) {
        payload.sumatif = loadFromLocal("merdeka_sumatif");
        payload.pengolahanNilai = loadFromLocal("merdeka_pengolahanNilai");
        payload.intervensi = loadFromLocal("merdeka_intervensi");
      }
      if (syncOptions.rapor) {
        payload.rapor = loadFromLocal("merdeka_rapor");
      }

      const timestamp = new Date().toISOString();
      await setDoc(doc(db, "sync_backups", `backup_${timestamp}`), {
        timestamp,
        data: payload
      });

      ToastNotifier.success("Sync berhasil dikirim ke Cloud");
      setIsOpen(false);
    } catch (error: any) {
      console.error(error);
      ToastNotifier.error(`Sync gagal: ${error.message || "Unknown error"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 p-2 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 mx-2"
      >
        <CloudUpload className="w-4 h-4 text-emerald-600" />
        <span className="hidden sm:inline">Sinkron ke Cloud</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm shadow-xl border border-white/10 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-emerald-600" />
                Sinkronisasi ke Cloud
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                disabled={isSyncing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-4">Pilih data yang ingin disinkronkan ke Firebase. Data lokal akan menjadi sumber kebenaran.</p>
              
              <div className="space-y-3 border p-4 rounded-lg bg-slate-50 border-slate-200">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="form-checkbox rounded text-emerald-600" checked={syncOptions.master} onChange={() => handleCheckboxChange("master")} disabled={isSyncing} />
                  <span className="text-sm font-medium text-slate-700">Master Data (Sekolah, Tahun, Kelas, Murid, Guru)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="form-checkbox rounded text-emerald-600" checked={syncOptions.perencanaan} onChange={() => handleCheckboxChange("perencanaan")} disabled={isSyncing} />
                  <span className="text-sm font-medium text-slate-700">Perencanaan Pembelajaran (TP)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="form-checkbox rounded text-emerald-600" checked={syncOptions.kktp} onChange={() => handleCheckboxChange("kktp")} disabled={isSyncing} />
                  <span className="text-sm font-medium text-slate-700">KKTP</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="form-checkbox rounded text-emerald-600" checked={syncOptions.formatif} onChange={() => handleCheckboxChange("formatif")} disabled={isSyncing} />
                  <span className="text-sm font-medium text-slate-700">Asesmen Formatif</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="form-checkbox rounded text-emerald-600" checked={syncOptions.sumatif} onChange={() => handleCheckboxChange("sumatif")} disabled={isSyncing} />
                  <span className="text-sm font-medium text-slate-700">Asesmen Sumatif & Pengolahan</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="form-checkbox rounded text-emerald-600" checked={syncOptions.rapor} onChange={() => handleCheckboxChange("rapor")} disabled={isSyncing} />
                  <span className="text-sm font-medium text-slate-700">Data E-Rapor (Deskripsi & Draft)</span>
                </label>
              </div>

              {isSyncing && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 animate-pulse text-center font-medium">
                  Sedang sinkronisasi... Mohon tunggu.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={isSyncing}
              >
                Batal
              </button>
              <button
                onClick={handleSync}
                className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                disabled={isSyncing}
              >
                <CloudUpload className="w-4 h-4" />
                Mulai Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
