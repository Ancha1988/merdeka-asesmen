"use client";

import { TujuanPembelajaran } from "@/types";
import { Edit2, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface TpCardProps {
  tp: TujuanPembelajaran;
  onEdit: (tp: TujuanPembelajaran) => void;
  onDelete: (tp: TujuanPembelajaran) => void;
  onMoveUp?: (tp: TujuanPembelajaran) => void;
  onMoveDown?: (tp: TujuanPembelajaran) => void;
  kelasNames: string;
}

export function TpCard({ tp, onEdit, onDelete, onMoveUp, onMoveDown, kelasNames }: TpCardProps) {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-2">
        <div className="flex gap-2 items-center">
          <span className="shrink-0 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
            Fase {tp.fase}
          </span>
          <span className="shrink-0 bg-slate-100 text-slate-800 text-xs font-medium px-2 py-1 rounded">
            Urutan: {tp.urutan}
          </span>
        </div>
        <div className="flex gap-1 shrink-0">
          {onMoveUp && (
            <button onClick={() => onMoveUp(tp)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="Naik urutan">
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
          {onMoveDown && (
            <button onClick={() => onMoveDown(tp)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="Turun urutan">
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="font-semibold text-slate-900 line-clamp-2" title={tp.kompetensi}>
          {tp.kompetensi}
        </h4>
        <p className="text-sm text-slate-600 line-clamp-2" title={tp.lingkupMateri}>
          {tp.lingkupMateri}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
        <div>
          <span className="font-medium">Kelas:</span> {kelasNames}
        </div>
        <div>
          <span className="font-medium">Waktu:</span> {tp.alokasiWaktu} JP
        </div>
        <div>
          <span className="font-medium">Indikator:</span> {tp.indikator.length}
        </div>
        <div>
          <span className="font-medium">Dimensi:</span> {tp.dimensiIds.length}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-auto pt-3 border-t">
        <button
          onClick={() => onEdit(tp)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <Edit2 className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={() => onDelete(tp)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Hapus
        </button>
      </div>
    </div>
  );
}
