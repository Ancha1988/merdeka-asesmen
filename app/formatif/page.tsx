"use client";

import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { ObservasiTab } from "@/components/formatif/ObservasiTab";
import { AnekdotTab } from "@/components/formatif/AnekdotTab";
import { CatsTab } from "@/components/formatif/CatsTab";
import { RefleksiTab } from "@/components/formatif/RefleksiTab";
import { AsesmenFormatif } from "@/types";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export default function FormatifPage() {
  const { kelas, murid, tp, formatif, updateFormatif } = useMasterData();
  
  const [activeTab, setActiveTab] = useState<"observasi" | "anekdot" | "cats" | "refleksi">("observasi");
  
  const [selectedKelasId, setSelectedKelasId] = useState("");
  const [selectedMuridId, setSelectedMuridId] = useState("");
  const [selectedTpId, setSelectedTpId] = useState("");

  const activeKelas = kelas.find(k => k.kelasId === selectedKelasId);
  
  // Filter murid based on activeKelas
  const availableMurid = murid.filter(m => m.kelasId === selectedKelasId && m.status === 'aktif');
  
  // Filter TP based on selectedKelas (TP must target this class)
  const availableTp = tp.filter(t => t.kelasTargetIds.includes(selectedKelasId));

  const handleKelasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKelasId(e.target.value);
    setSelectedMuridId("");
    setSelectedTpId("");
  };

  const handleMuridChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMuridId(e.target.value);
  };

  const tabs = [
    { id: "observasi", label: "Observasi Harian" },
    { id: "anekdot", label: "Catatan Anekdotal" },
    { id: "cats", label: "CATs" },
    { id: "refleksi", label: "Refleksi Murid" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Asesmen Formatif</h1>
        <p className="text-slate-500">Pencatatan harian perkembangan murid (Low-Stake, tidak masuk gabungan nilai akhir).</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">1. Pilih Kelas</label>
            <select 
              value={selectedKelasId}
              onChange={handleKelasChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Kelas --</option>
              {kelas.filter(k => k.isActive).map(k => (
                <option key={k.kelasId} value={k.kelasId}>{k.namaKelas} (Tingkat {k.tingkat})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">2. Pilih Murid</label>
            <select 
              value={selectedMuridId}
              onChange={handleMuridChange}
              disabled={!selectedKelasId}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:opacity-75"
            >
              <option value="">-- Pilih Murid --</option>
              {availableMurid.map(m => (
                <option key={m.muridId} value={m.muridId}>[{m.nisn}] {m.nama} - {m.jenisKelamin}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">3. Pilih TP</label>
            <select 
              value={selectedTpId}
              onChange={(e) => setSelectedTpId(e.target.value)}
              disabled={!selectedKelasId}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:opacity-75"
            >
              <option value="">-- Pilih TP --</option>
              {availableTp.map(t => (
                <option key={t.tpId} value={t.tpId}>{t.urutan}. {t.kompetensi.substring(0, 50)}...</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border text-center p-3 rounded-md text-sm text-amber-800 bg-amber-50">
        Jika ada pilihan yang tidak terisi, Anda bisa melihat data tanpa input baru, atau menginput secara massal tergantung tab.
      </div>

      {/* TABS */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm min-h-[400px]">
        {activeTab === "observasi" && (
          <ObservasiTab 
            kelasId={selectedKelasId} 
            muridId={selectedMuridId} 
            tpId={selectedTpId}
          />
        )}
        {activeTab === "anekdot" && (
          <AnekdotTab 
            kelasId={selectedKelasId} 
            muridId={selectedMuridId} 
            tpId={selectedTpId}
          />
        )}
        {activeTab === "cats" && (
          <CatsTab 
            kelasId={selectedKelasId} 
            muridId={selectedMuridId} 
            tpId={selectedTpId}
          />
        )}
        {activeTab === "refleksi" && (
          <RefleksiTab 
            kelasId={selectedKelasId} 
            muridId={selectedMuridId} 
            tpId={selectedTpId}
          />
        )}
      </div>

    </div>
  );
}
