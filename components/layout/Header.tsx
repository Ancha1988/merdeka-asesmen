"use client";

import { useAppStore } from "@/store/useAppStore";
import { Bell } from "lucide-react";
import { FirebaseSync } from "../shared/FirebaseSync";

export function Header() {
  const { tahunAjaranAktif } = useAppStore();

  return (
    <header className="h-16 px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
          Sistem Asesmen Kurikulum Merdeka
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {tahunAjaranAktif ? (
          <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            TA: {tahunAjaranAktif.tahun} - SMT {tahunAjaranAktif.semester}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            Set Tahun Ajaran!
          </div>
        )}
        
        <FirebaseSync />

        <button className="p-2 text-slate-400 hover:text-slate-600">
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
      </div>
    </header>
  );
}
