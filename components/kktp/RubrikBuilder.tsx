"use client";

import { useEffect, useState } from "react";
import { Plus, X, ChevronRight, CheckCircle2, Settings } from "lucide-react";
import { RubrikItem } from "@/types";

interface RubrikBuilderProps {
  items: RubrikItem[];
  onChange: (items: RubrikItem[]) => void;
  tpIndikator?: string[];
  error?: string;
}

const DEFAULT_RUBRIK_TEMPLATE: Omit<RubrikItem, 'indikator'>[] = [
  { tingkatan: "BB", label: "Baru Berkembang", deskripsi: "", nilaiMin: 0, nilaiMax: 60 },
  { tingkatan: "L", label: "Layak", deskripsi: "", nilaiMin: 61, nilaiMax: 70 },
  { tingkatan: "C", label: "Cakap", deskripsi: "", nilaiMin: 71, nilaiMax: 80 },
  { tingkatan: "M", label: "Mahir", deskripsi: "", nilaiMin: 81, nilaiMax: 100 },
];

export function RubrikBuilder({ items = [], onChange, tpIndikator = [], error }: RubrikBuilderProps) {
  const [activeIndikator, setActiveIndikator] = useState<string | null>(tpIndikator[0] || null);
  
  // Auto init
  useEffect(() => {
    if (!items || items.length === 0) {
      if (tpIndikator && tpIndikator.length > 0) {
        const newItems = tpIndikator.flatMap(ind => 
          DEFAULT_RUBRIK_TEMPLATE.map(t => ({ ...t, indikator: ind }))
        );
        onChange(newItems);
      } else {
        onChange(DEFAULT_RUBRIK_TEMPLATE.map(t => ({ ...t, indikator: "Umum" })));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeItems = (items || []).filter(item => 
    tpIndikator.length > 0 ? item.indikator === activeIndikator : true
  );

  const handleChange = (indexInActive: number, field: keyof RubrikItem, value: any) => {
    const itemToUpdate = activeItems[indexInActive];
    const actualIndex = items.findIndex(i => i === itemToUpdate);
    
    if (actualIndex !== -1) {
      const newItems = [...items];
      newItems[actualIndex] = { ...newItems[actualIndex], [field]: value };
      onChange(newItems);
    }
  };

  const handleAdd = () => {
    const newItem: RubrikItem = { 
      indikator: activeIndikator || "Umum",
      tingkatan: "BB", 
      label: "Custom Tingkatan", 
      deskripsi: "", 
      nilaiMin: 0, 
      nilaiMax: 0 
    };
    onChange([...(items || []), newItem]);
  };

  const handleRemove = (indexInActive: number) => {
    const itemToRemove = activeItems[indexInActive];
    const actualIndex = items.findIndex(i => i === itemToRemove);
    
    if (actualIndex !== -1) {
      const newItems = [...items];
      newItems.splice(actualIndex, 1);
      onChange(newItems);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
        <strong>Jenis Rubrik Deskriptif:</strong> Gunakan rubrik ini jika penilaian didasarkan pada kualitas capaian murid. Anda dapat mengatur parameter rubrik untuk <strong>setiap indikator</strong> yang ada di TP ini.
      </div>

      {tpIndikator.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar Indikator */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Pilih Indikator
            </h4>
            <div className="space-y-2">
              {tpIndikator.map((ind, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndikator(ind)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-start justify-between group ${
                    activeIndikator === ind
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-medium flex-1 pr-2 leading-relaxed">{ind}</span>
                  <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-transform ${activeIndikator === ind ? 'text-blue-600 translate-x-1' : 'text-slate-400 group-hover:text-slate-500'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Form Rubrik */}
          <div className="md:col-span-8">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Parameter Rubrik</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{activeIndikator}</p>
                </div>
              </div>

              <div className="space-y-4">
                {activeItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-3 border border-slate-200 rounded-md">
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Tingkat / Label</label>
                      <div className="flex gap-1.5">
                         <select
                          value={item.tingkatan}
                          onChange={(e) => handleChange(index, 'tingkatan', e.target.value)}
                          className="w-16 px-1.5 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                         >
                           <option value="BB">BB</option>
                           <option value="L">L</option>
                           <option value="C">C</option>
                           <option value="M">M</option>
                         </select>
                         <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleChange(index, 'label', e.target.value)}
                          placeholder="Label..."
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Deskripsi Capaian</label>
                      <textarea
                        value={item.deskripsi}
                        onChange={(e) => handleChange(index, 'deskripsi', e.target.value)}
                        placeholder="Deskripsi pencapaian untuk tingkat ini..."
                        rows={2}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500">Rentang Ekivalen</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.nilaiMin}
                          onChange={(e) => handleChange(index, 'nilaiMin', Number(e.target.value))}
                          className="w-full px-1.5 py-1.5 border border-slate-300 rounded-md text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-slate-400 text-xs">-</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.nilaiMax}
                          onChange={(e) => handleChange(index, 'nilaiMax', Number(e.target.value))}
                          className="w-full px-1.5 py-1.5 border border-slate-300 rounded-md text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-1 flex items-center justify-end">
                      {activeItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 mt-4"
              >
                <Plus className="w-3 h-3" /> Tambah Tingkatan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeItems.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 border border-slate-200 rounded-md shadow-sm">
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-semibold text-slate-500">Tingkatan / Label</label>
                <div className="flex gap-2">
                   <select
                    value={item.tingkatan}
                    onChange={(e) => handleChange(index, 'tingkatan', e.target.value)}
                    className="w-20 px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                   >
                     <option value="BB">BB</option>
                     <option value="L">L</option>
                     <option value="C">C</option>
                     <option value="M">M</option>
                   </select>
                   <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleChange(index, 'label', e.target.value)}
                    placeholder="Label..."
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-6 space-y-1">
                <label className="text-xs font-semibold text-slate-500">Deskripsi Capaian</label>
                <textarea
                  value={item.deskripsi}
                  onChange={(e) => handleChange(index, 'deskripsi', e.target.value)}
                  placeholder="Deskripsi pencapaian untuk tingkat ini..."
                  rows={2}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500">Rentang Ekivalen Nilai</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.nilaiMin}
                    onChange={(e) => handleChange(index, 'nilaiMin', Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.nilaiMax}
                    onChange={(e) => handleChange(index, 'nilaiMax', Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex items-center justify-end">
                {activeItems.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
          >
            <Plus className="w-4 h-4" /> Tambah Tingkatan
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
