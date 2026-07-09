"use client";

import { useEffect, useMemo } from "react";
import { Plus, X } from "lucide-react";
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

export function RubrikBuilder({ items = [], onChange, tpIndikator, error }: RubrikBuilderProps) {
  
  // Auto init
  useEffect(() => {
    if (!items || items.length === 0) {
      const initialItems: RubrikItem[] = [];
      if (tpIndikator && tpIndikator.length > 0) {
        tpIndikator.forEach(ind => {
          DEFAULT_RUBRIK_TEMPLATE.forEach(template => {
            initialItems.push({ ...template, indikator: ind });
          });
        });
      } else {
        DEFAULT_RUBRIK_TEMPLATE.forEach(template => {
          initialItems.push({ ...template });
        });
      }
      onChange(initialItems);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index: number, field: keyof RubrikItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleAdd = (indikatorName?: string) => {
    onChange([...(items || []), { 
      indikator: indikatorName === "Umum" ? undefined : indikatorName,
      tingkatan: "BB", 
      label: "Custom", 
      deskripsi: "", 
      nilaiMin: 0, 
      nilaiMax: 0 
    }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, (RubrikItem & { originalIndex: number })[]> = {};
    (items || []).forEach((item, index) => {
      const key = item.indikator || "Umum";
      if (!groups[key]) groups[key] = [];
      groups[key].push({ ...item, originalIndex: index });
    });
    return groups;
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
        <strong>Jenis Rubrik Deskriptif:</strong> Gunakan rubrik ini jika penilaian didasarkan pada kualitas capaian murid (misal: Baru Berkembang, Layak, Cakap, Mahir). Tentukan rubrik untuk setiap indikator yang diukur.
      </div>

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([indicatorText, groupItems], groupIndex) => (
          <div key={groupIndex} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Indikator</span>
              {indicatorText}
            </h4>

            <div className="space-y-3">
              {groupItems.map((item) => (
                <div key={item.originalIndex} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                  
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Tingkatan / Label</label>
                    <div className="flex gap-2">
                      <select
                        value={item.tingkatan}
                        onChange={(e) => handleChange(item.originalIndex, 'tingkatan', e.target.value)}
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
                        onChange={(e) => handleChange(item.originalIndex, 'label', e.target.value)}
                        placeholder="Label..."
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-6 space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Deskripsi Capaian</label>
                    <textarea
                      value={item.deskripsi}
                      onChange={(e) => handleChange(item.originalIndex, 'deskripsi', e.target.value)}
                      placeholder={`Deskripsi pencapaian tingkat ${item.tingkatan} untuk indikator ini...`}
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
                        onChange={(e) => handleChange(item.originalIndex, 'nilaiMin', Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.nilaiMax}
                        onChange={(e) => handleChange(item.originalIndex, 'nilaiMax', Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1 flex items-center justify-end">
                    {groupItems.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemove(item.originalIndex)}
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
              onClick={() => handleAdd(indicatorText)}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
            >
              <Plus className="w-4 h-4" /> Tambah Tingkatan ({indicatorText})
            </button>
          </div>
        ))}
      </div>

      {(!items || items.length === 0) && (
        <button
          type="button"
          onClick={() => handleAdd()}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
        >
          <Plus className="w-4 h-4" /> Tambah Tingkatan Umum
        </button>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
