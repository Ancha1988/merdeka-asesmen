"use client";

import { useEffect } from "react";
import { PersentaseConfig } from "@/types";

interface PersentaseBuilderProps {
  value: PersentaseConfig;
  onChange: (value: PersentaseConfig) => void;
  error?: string;
}

export function PersentaseBuilder({ value, onChange, error }: PersentaseBuilderProps) {
  
  // Auto init
  useEffect(() => {
    if (!value || typeof value.totalIndikator !== "number") {
      onChange({ totalIndikator: 10, thresholdMelebihi: 60 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field: keyof PersentaseConfig, val: number) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
        <strong>Jenis Persentase:</strong> Penentuan lulus atau tidak didasarkan pada proporsi hasil capaian (misal jumlah indikator tuntas dibanding total indikator uji).
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border border-slate-200 rounded-md shadow-sm">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Total Soal / Indikator Penilaian</label>
          <input
            type="number"
            min="1"
            value={value?.totalIndikator || 10}
            onChange={(e) => handleChange('totalIndikator', Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500">Berapa poin maksimal atau jumlah soal yang ada?</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Batas Tuntas (Threshold) %</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="100"
              value={value?.thresholdMelebihi || 60}
              onChange={(e) => handleChange('thresholdMelebihi', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
            />
            <span className="absolute right-3 top-2 text-slate-400 font-medium">%</span>
          </div>
          <p className="text-xs text-slate-500">Murid dianggap tuntas jika mencapai persentase di atas.</p>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
