"use client";

import { useEffect, useState } from "react";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { RubrikItem } from "@/types";

interface RubrikBuilderProps {
  items: RubrikItem[];
  onChange: (items: RubrikItem[]) => void;
  tpIndikator?: string[];
  error?: string;
}

const DEFAULT_RUBRIK_LEVELS = [
  { tingkatan: "BB", label: "Baru Berkembang", nilaiMin: 0, nilaiMax: 60 },
  { tingkatan: "L", label: "Layak", nilaiMin: 61, nilaiMax: 70 },
  { tingkatan: "C", label: "Cakap", nilaiMin: 71, nilaiMax: 80 },
  { tingkatan: "M", label: "Mahir", nilaiMin: 81, nilaiMax: 100 },
];

export function RubrikBuilder({ items = [], onChange, tpIndikator = [], error }: RubrikBuilderProps) {
  const [expandedIndikator, setExpandedIndikator] = useState<string | null>(
    tpIndikator.length > 0 ? tpIndikator[0] : null
  );

  // Auto init for all indicators
  useEffect(() => {
    if (!items || items.length === 0) {
      if (tpIndikator && tpIndikator.length > 0) {
        const initialItems: RubrikItem[] = [];
        tpIndikator.forEach((ind) => {
          DEFAULT_RUBRIK_LEVELS.forEach(level => {
            initialItems.push({
              indikatorId: ind,
              tingkatan: level.tingkatan as any,
              label: level.label,
              deskripsi: "",
              nilaiMin: level.nilaiMin,
              nilaiMax: level.nilaiMax
            });
          });
        });
        onChange(initialItems);
      } else {
        const defaultItems = DEFAULT_RUBRIK_LEVELS.map(level => ({
          ...level,
          tingkatan: level.tingkatan as any,
          deskripsi: ""
        }));
        onChange(defaultItems);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpIndikator]);

  const handleChange = (index: number, field: keyof RubrikItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleAdd = (indikatorId?: string) => {
    onChange([...(items || []), { 
      indikatorId, 
      tingkatan: "BB", 
      label: "Custom Tingkatan", 
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

  const renderRubrikList = (indikatorId?: string) => {
    const filteredItems = items.map((item, originalIndex) => ({ item, originalIndex }))
                               .filter(x => x.item.indikatorId === indikatorId);
    
    return (
      <div className="space-y-4 mt-4">
        {filteredItems.map(({ item, originalIndex }) => (
          <div key={originalIndex} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 border border-slate-200 rounded-md shadow-sm">
            
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-500">Tingkatan / Label</label>
              <div className="flex gap-2">
                 <select
                  value={item.tingkatan}
                  onChange={(e) => handleChange(originalIndex, 'tingkatan', e.target.value)}
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
                  onChange={(e) => handleChange(originalIndex, 'label', e.target.value)}
                  placeholder="Label..."
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-6 space-y-1">
              <label className="text-xs font-semibold text-slate-500">Deskripsi Capaian</label>
              <textarea
                value={item.deskripsi}
                onChange={(e) => handleChange(originalIndex, 'deskripsi', e.target.value)}
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
                  onChange={(e) => handleChange(originalIndex, 'nilaiMin', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={item.nilaiMax}
                  onChange={(e) => handleChange(originalIndex, 'nilaiMax', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-1 flex items-center justify-end">
              {filteredItems.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemove(originalIndex)}
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
          onClick={() => handleAdd(indikatorId)}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
        >
          <Plus className="w-4 h-4" /> Tambah Tingkatan
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
        <strong>Jenis Rubrik Deskriptif:</strong> Gunakan rubrik ini jika penilaian didasarkan pada kualitas capaian murid per indikator (misal: Baru Berkembang, Layak, Cakap, Mahir). Pastikan rentang nilai tidak beririsan (overlap).
      </div>

      {tpIndikator && tpIndikator.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700">Atur Rubrik untuk setiap Indikator Tujuan Pembelajaran:</p>
          {tpIndikator.map((ind, idx) => {
            const isExpanded = expandedIndikator === ind;
            return (
              <div key={idx} className="border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setExpandedIndikator(isExpanded ? null : ind)}
                  className="w-full flex items-center justify-between p-3 text-left bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <div className="flex gap-3 items-center">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-800 text-sm line-clamp-2">{ind}</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                {isExpanded && (
                  <div className="p-4 border-t border-slate-200">
                    {renderRubrikList(ind)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        renderRubrikList(undefined)
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

