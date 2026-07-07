"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Kelas, Guru, TahunAjaran } from "@/types";
import { SaveButton } from "@/components/shared/SaveButton";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { generateId } from "@/lib/utils";
import { FASE_SEKOLAH } from "@/lib/constants";

const kelasSchema = z.object({
  namaKelas: z.string().min(1, "Nama Kelas wajib diisi"),
  fase: z.enum(["A", "B", "C", "D", "E"]),
  tingkat: z.number().min(1, "Minimal 1").max(12, "Maksimal 12"),
  waliKelasId: z.string().optional(),
  kapasitas: z.number().min(1, "Minimal 1"),
});

type KelasFormValues = z.infer<typeof kelasSchema>;

interface KelasFormProps {
  initialData?: Kelas;
  guruData: Guru[];
  tahunAjaranAktif: TahunAjaran;
  onSave: (data: Kelas) => void;
  onCancel: () => void;
}

export function KelasForm({ initialData, guruData, tahunAjaranAktif, onSave, onCancel }: KelasFormProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success">("idle");
  const [pendingData, setPendingData] = useState<KelasFormValues | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<KelasFormValues>({
    resolver: zodResolver(kelasSchema),
    defaultValues: {
      namaKelas: initialData?.namaKelas || "",
      fase: initialData?.fase || "D",
      tingkat: initialData?.tingkat || 7,
      waliKelasId: initialData?.waliKelasId || "",
      kapasitas: initialData?.kapasitas || 32,
    },
  });

  const onSubmit = (data: KelasFormValues) => {
    setPendingData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!pendingData) return;
    setIsConfirmOpen(false);
    setSaveStatus("loading");
    
    setTimeout(() => {
      const data: Kelas = {
        kelasId: initialData?.kelasId || generateId(),
        ...pendingData,
        waliKelasId: pendingData.waliKelasId || null,
        tahunId: tahunAjaranAktif.tahunId,
        muridIds: initialData?.muridIds || [],
        isActive: true,
      };
      
      onSave(data);
      setSaveStatus("success");
      ToastNotifier.success(`Kelas ${data.namaKelas} berhasil disimpan!`);
      setTimeout(() => {
        setSaveStatus("idle");
      }, 1000);
    }, 500);
  };

  const guruOptions = guruData.filter(g => g.isActive && g.role === "guru");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialData ? "Edit Kelas / Rombel" : "Tambah Kelas / Rombel"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kelas <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Contoh: 7A, X-TKJ-1" {...register("namaKelas")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            {errors.namaKelas && <p className="text-red-500 text-xs mt-1">{errors.namaKelas.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fase <span className="text-red-500">*</span></label>
              <select {...register("fase")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                {FASE_SEKOLAH.map(f => (
                   <option key={f} value={f}>Fase {f}</option>
                ))}
              </select>
              {errors.fase && <p className="text-red-500 text-xs mt-1">{errors.fase.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat (kelas) <span className="text-red-500">*</span></label>
              <input type="number" {...register("tingkat", { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              {errors.tingkat && <p className="text-red-500 text-xs mt-1">{errors.tingkat.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Wali Kelas</label>
              <select {...register("waliKelasId")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="">-- Pilih Guru --</option>
                {guruOptions.map(g => (
                   <option key={g.uid} value={g.uid}>{g.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kapasitas</label>
              <input type="number" {...register("kapasitas", { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              {errors.kapasitas && <p className="text-red-500 text-xs mt-1">{errors.kapasitas.message}</p>}
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
            <p className="text-xs text-blue-800">Kelas akan otomatis ditautkan ke Tahun Ajaran aktif: <strong>{tahunAjaranAktif.tahun}</strong></p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">Batal</button>
            <SaveButton type="submit" status={saveStatus} />
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Simpan Kelas?"
        description="Simpan data kelas untuk Tahun Ajaran aktif."
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
