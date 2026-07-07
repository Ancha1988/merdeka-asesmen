"use client";

import { DimensiProfil } from "@/types";
import { DIMENSI_PROFIL } from "@/lib/constants";
import { Check, Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface DimensiSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

export function DimensiSelector({ selectedIds, onChange, error }: DimensiSelectorProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(v => v !== id));
    } else {
      if (selectedIds.length < 8) {
        onChange([...selectedIds, id]);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-700">Dimensi Profil Pelajar Pancasila <span className="text-red-500">*</span></label>
        <span className="text-xs text-slate-500">{selectedIds.length}/8 Dimensi</span>
      </div>
      
      <Tooltip.Provider delayDuration={200}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DIMENSI_PROFIL.map(dimensi => {
            const isSelected = selectedIds.includes(dimensi.dimensiId);
            return (
              <Tooltip.Root key={dimensi.dimensiId}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    onClick={() => toggle(dimensi.dimensiId)}
                    className={`
                      relative p-3 rounded-lg border text-left flex flex-col gap-2 transition-all h-full
                      ${isSelected 
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-1.5 rounded-md ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        {/* We rely on text instead of Lucide icons to reduce dynamic import complexity here, or we can use small icons manually if needed, but since we don't have dynamic icons mapped easily, we'll just show the code. */}
                        <span className="font-bold text-xs">{dimensi.kode}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                      {dimensi.nama}
                    </span>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content 
                    className="z-50 bg-slate-900 text-white text-xs p-2 rounded max-w-xs shadow-lg"
                    sideOffset={5}
                  >
                    {dimensi.deskripsi}
                    <Tooltip.Arrow className="fill-slate-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )
          })}
        </div>
      </Tooltip.Provider>
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
