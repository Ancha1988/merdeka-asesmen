"use client";

import { useEffect } from "react";
import { Plus, X } from "lucide-react";
import { RubrikItem } from "@/types";

interface RubrikBuilderProps {
  items: RubrikItem[];
  onChange: (items: RubrikItem[]) => void;
  error?: string;
}

const DEFAULT_RUBRIK: RubrikItem[] = [
  { tingkatan: "BB", label: "Baru Berkembang", deskripsi: "", nilaiMin: 0, nilaiMax: 60 },
  { tingkatan: "L", label: "Layak", deskripsi: "", nilaiMin: 61, nilaiMax: 70 },
  { tingkatan: "C", label: "Cakap", deskripsi: "", nilaiMin: 71, nilaiMax: 80 },
  { tingkatan: "M", label: "Mahir", deskripsi: "", nilaiMin: 81, nilaiMax: 100 },
];

export function RubrikBuilder({ items = [], onChange, error }: RubrikBuilderProps) {
  
  // Auto init
  useEffect(() => {
    if (!items || items.length === 0) {
      onChange(DEFAULT_RUBRIK);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index: number, field: keyof RubrikItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleAdd = () => {
    onChange([...(items || []), { tingkatan: "BB", label: "Custom Tingkatan", deskripsi: "", nilaiMin: 0, nilaiMax: 0 }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
        <strong>Jenis Rubrik Deskriptif:</strong> Gunakan rubrik ini jika penilaian didasarkan pada kualitas capaian murid (misal: Baru Berkembang, Layak, Cakap, Mahir). Pastikan rentang nilai tidak beririsan (overlap).
      </div>

      <div className="space-y-4">
        {(items || []).map((item, index) => (
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
              {(items || []).length > 2 && (
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
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
      >
        <Plus className="w-4 h-4" /> Tambah Tingkatan
      </button>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
