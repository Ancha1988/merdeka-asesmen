"use client";

import { useMasterData } from "@/hooks/useMasterData";
import { SekolahForm } from "@/components/pengaturan/sekolah/SekolahForm";
import { Loader2 } from "lucide-react";

export default function SekolahPage() {
  const { sekolah, updateSekolah, isLoading } = useMasterData();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil Sekolah</h1>
        <p className="text-slate-500 mt-1">Kelola data profil sekolah yang akan tampil pada laporan dan E-Rapor.</p>
      </div>

      <SekolahForm initialData={sekolah} onSave={updateSekolah} />
    </div>
  );
}
