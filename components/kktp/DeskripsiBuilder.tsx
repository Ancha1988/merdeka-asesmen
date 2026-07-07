"use client";

import { useEffect } from "react";
import { Plus, X } from "lucide-react";
import { KktpIndikator } from "@/types";

interface DeskripsiBuilderProps {
  items: KktpIndikator[];
  onChange: (items: KktpIndikator[]) => void;
  tpIndikator: string[]; // Indikator dari TP untuk auto-fill opsional
  error?: string;
}

export function DeskripsiBuilder({ items = [], onChange, tpIndikator, error }: DeskripsiBuilderProps) {
  
  // Auto init if empty
  useEffect(() => {
    if ((!items || items.length === 0) && tpIndikator && tpIndikator.length > 0) {
      const initialItems = tpIndikator.map((ind, idx) => ({
        indikatorId: `ind-${Date.now()}-${idx}`,
        deskripsi: ind,
        thresholdLulus: true // default wajib
      }));
      onChange(initialItems);
    } else if (!items || items.length === 0) {
      onChange([{ indikatorId: `ind-${Date.now()}`, deskripsi: "", thresholdLulus: true }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    onChange([...(items || []), { indikatorId: `ind-${Date.now()}`, deskripsi: "", thresholdLulus: true }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleChange = (index: number, field: keyof KktpIndikator, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
        <strong>Jenis Deskripsi / Ceklis:</strong> Penilaian dilakukan dengan memberikan tanda ceklis (✅) pada setiap indikator yang tercapai saat asesmen.
      </div>

      <div className="space-y-3">
        {(items || []).map((item, index) => (
          <div key={item.indikatorId} className="flex items-start gap-3 bg-white p-3 border border-slate-200 rounded-md shadow-sm">
            <div className="font-medium text-slate-500 pt-2">{index + 1}.</div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={item.deskripsi}
                onChange={(e) => handleChange(index, 'deskripsi', e.target.value)}
                placeholder="Deskripsi indikator..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={item.thresholdLulus}
                  onChange={(e) => handleChange(index, 'thresholdLulus', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Indikator ini wajib (threshold) untuk mencapai status Tuntas
              </label>
            </div>
            {(items || []).length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
      >
        <Plus className="w-4 h-4" /> Tambah Indikator
      </button>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
