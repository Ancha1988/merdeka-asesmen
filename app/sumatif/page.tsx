"use client";

import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { InputNilaiTab } from "@/components/sumatif/InputNilaiTab";
import { PengolahanTab } from "@/components/sumatif/PengolahanTab";
import { RemedialTab } from "@/components/sumatif/RemedialTab";
import { KeputusanTab } from "@/components/sumatif/KeputusanTab";

export default function SumatifPage() {
  const { kelas, tp } = useMasterData();
  
  const [activeTab, setActiveTab] = useState<"input" | "pengolahan" | "remedial" | "keputusan">("input");
  const [selectedKelasId, setSelectedKelasId] = useState("");
  const [selectedTpId, setSelectedTpId] = useState("");

  const activeKelas = kelas.find(k => k.kelasId === selectedKelasId);
  const availableTp = tp.filter(t => t.kelasTargetIds.includes(selectedKelasId));

  const handleKelasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKelasId(e.target.value);
    setSelectedTpId("");
  };

  const tabs = [
    { id: "input", label: "1. Input Nilai" },
    { id: "pengolahan", label: "2. Pengolahan Nilai" },
    { id: "remedial", label: "3. Remedial & Pengayaan" },
    { id: "keputusan", label: "4. Keputusan" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Asesmen Sumatif & Rapor</h1>
        <p className="text-slate-500">Input nilai akhir TP, pengolahan, serta tindak lanjut remedial.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">2. Pilih TP (Tujuan Pembelajaran)</label>
            <select 
              value={selectedTpId}
              onChange={(e) => setSelectedTpId(e.target.value)}
              disabled={!selectedKelasId}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:opacity-75"
            >
              <option value="">-- Pilih TP --</option>
              {availableTp.map(t => (
                <option key={t.tpId} value={t.tpId}>{t.urutan}. {t.kompetensi.substring(0, 70)}...</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm min-h-[500px]">
        {activeTab === "input" && (
          <InputNilaiTab 
            kelasId={selectedKelasId} 
            tpId={selectedTpId} 
          />
        )}
        {activeTab === "pengolahan" && (
          <PengolahanTab 
            kelasId={selectedKelasId} 
            tpId={selectedTpId} 
          />
        )}
        {activeTab === "remedial" && (
          <RemedialTab 
            kelasId={selectedKelasId} 
            tpId={selectedTpId} 
          />
        )}
        {activeTab === "keputusan" && (
          <KeputusanTab 
            kelasId={selectedKelasId} 
          />
        )}
      </div>
    </div>
  );
}
