"use client";

import { Plus, X } from "lucide-react";

interface IndikatorInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  error?: string;
}

export function IndikatorInput({ items, onChange, error }: IndikatorInputProps) {
  const handleAdd = () => {
    onChange([...items, ""]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-700">Indikator Ketercapaian <span className="text-red-500">*</span></label>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder="Contoh: Menyelesaikan soal cerita pecahan..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Hapus indikator"
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
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <Plus className="w-4 h-4" /> Tambah Indikator
      </button>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
