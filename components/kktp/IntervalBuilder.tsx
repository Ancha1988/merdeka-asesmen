"use client";

import { useEffect } from "react";
import { Plus, X } from "lucide-react";
import { IntervalItem } from "@/types";

interface IntervalBuilderProps {
  items: IntervalItem[];
  onChange: (items: IntervalItem[]) => void;
  error?: string;
}

const DEFAULT_INTERVAL: IntervalItem[] = [
  { label: "Belum Tuntas (Remedial Seluruh)", nilaiMin: 0, nilaiMax: 40, rekomendasi: "remedial_total" },
  { label: "Belum Tuntas (Remedial Parsial)", nilaiMin: 41, nilaiMax: 65, rekomendasi: "remedial_parsial" },
  { label: "Sudah Tuntas", nilaiMin: 66, nilaiMax: 85, rekomendasi: "lulus" },
  { label: "Sudah Tuntas (Pengayaan)", nilaiMin: 86, nilaiMax: 100, rekomendasi: "pengayaan" },
];

export function IntervalBuilder({ items = [], onChange, error }: IntervalBuilderProps) {
  
  // Auto init
  useEffect(() => {
    if (!items || items.length === 0) {
      onChange(DEFAULT_INTERVAL);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index: number, field: keyof IntervalItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleAdd = () => {
    onChange([...(items || []), { label: "Interval Baru", nilaiMin: 0, nilaiMax: 100, rekomendasi: "lulus" }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
        <strong>Jenis Interval Nilai:</strong> Tentukan rentang penilaian (0-100) dan rekomendasi tindak lanjutnya. Rentang nilai tidak boleh beririsan.
      </div>

      <div className="space-y-3">
        {(items || []).map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 border border-slate-200 rounded-md shadow-sm items-center">
            
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-500">Label Kriteria</label>
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleChange(index, 'label', e.target.value)}
                placeholder="Contoh: Sangat Baik"
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-500">Tindak Lanjut / Rekomendasi</label>
               <select
                value={item.rekomendasi}
                onChange={(e) => handleChange(index, 'rekomendasi', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                 <option value="remedial_total">Remedial Seluruh Bagian</option>
                 <option value="remedial_parsial">Remedial Bagian Tertentu</option>
                 <option value="lulus">Lulus / Tuntas</option>
                 <option value="pengayaan">Lulus & Diberi Pengayaan</option>
               </select>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-500">Rentang Nilai Min - Max</label>
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
              {(items || []).length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors mt-5"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
      >
        <Plus className="w-4 h-4" /> Tambah Interval
      </button>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
