"use client";

import { TujuanPembelajaran } from "@/types";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useMasterData } from "@/hooks/useMasterData";
import { ToastNotifier } from "@/components/shared/ToastNotifier";

interface AtpBuilderProps {
  items: TujuanPembelajaran[];
}

export function AtpBuilder({ items }: AtpBuilderProps) {
  const { tp, updateTp } = useMasterData();

  // Sort local items by urutan
  const sortedItems = [...items].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === sortedItems.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap urutan values between the two items
    const item1 = { ...sortedItems[index] };
    const item2 = { ...sortedItems[newIndex] };
    
    const tempUrutan = item1.urutan;
    item1.urutan = item2.urutan;
    item2.urutan = tempUrutan;

    // Update global state
    const newGlobalTp = [...tp];
    
    const idx1 = newGlobalTp.findIndex(t => t.tpId === item1.tpId);
    if (idx1 !== -1) newGlobalTp[idx1] = item1;
    
    const idx2 = newGlobalTp.findIndex(t => t.tpId === item2.tpId);
    if (idx2 !== -1) newGlobalTp[idx2] = item2;

    updateTp(newGlobalTp);
    ToastNotifier.success("Urutan berhasil diperbarui");
  };

  if (sortedItems.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
        Belum ada Tujuan Pembelajaran untuk fase ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedItems.map((item, index) => (
        <div key={item.tpId} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex flex-col gap-1 shrink-0">
            <button 
              onClick={() => handleMove(index, 'up')}
              disabled={index === 0}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Naik"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div className="text-center font-bold text-slate-700 bg-slate-100 rounded text-sm py-1">
              {item.urutan}
            </div>
            <button 
              onClick={() => handleMove(index, 'down')}
              disabled={index === sortedItems.length - 1}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Turun"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 truncate" title={item.kompetensi}>
              {item.kompetensi}
            </h4>
            <p className="text-sm text-slate-500 truncate mt-0.5" title={item.lingkupMateri}>
              {item.lingkupMateri}
            </p>
            <div className="flex gap-4 mt-2 text-xs text-slate-600">
              <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">Fase {item.fase}</span>
              <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">{item.alokasiWaktu} JP</span>
              <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">{item.indikator.length} Indikator</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
