"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TahunAjaran } from "@/types";
import { SaveButton } from "@/components/shared/SaveButton";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { generateId } from "@/lib/utils";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

const tahunAjaranSchema = z.object({
  tahun: z.string().regex(/^\d{4}\/\d{4}$/, "Format salah (contoh: 2025/2026)"),
  semester: z.union([z.literal(1), z.literal(2), z.literal("1"), z.literal("2")]),
  tanggalMulai: z.string().min(1, "Wajib diisi"),
  tanggalSelesai: z.string().min(1, "Wajib diisi"),
  isActive: z.boolean(),
});

type TAFormValues = z.infer<typeof tahunAjaranSchema>;

interface TahunAjaranFormProps {
  initialData?: TahunAjaran;
  onSave: (data: TahunAjaran) => void;
  onCancel: () => void;
}

export function TahunAjaranForm({ initialData, onSave, onCancel }: TahunAjaranFormProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success">("idle");
  const [pendingData, setPendingData] = useState<TAFormValues | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<TAFormValues>({
    resolver: zodResolver(tahunAjaranSchema),
    defaultValues: {
      tahun: initialData?.tahun || "",
      semester: initialData?.semester || 1,
      tanggalMulai: initialData?.tanggalMulai || "",
      tanggalSelesai: initialData?.tanggalSelesai || "",
      isActive: initialData?.isActive || false,
    },
  });

  const onSubmit = (data: TAFormValues) => {
    setPendingData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!pendingData) return;
    setIsConfirmOpen(false);
    setSaveStatus("loading");
    
    setTimeout(() => {
      const data: TahunAjaran = {
        tahunId: initialData?.tahunId || generateId(),
        ...pendingData,
        semester: pendingData.semester as 1 | 2,
      };
      
      onSave(data);
      setSaveStatus("success");
      ToastNotifier.success("Tahun Ajaran berhasil disimpan!");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialData ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Ajaran <span className="text-red-500">*</span></label>
              <input type="text" placeholder="2025/2026" {...register("tahun")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              {errors.tahun && <p className="text-red-500 text-xs mt-1">{errors.tahun.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semester <span className="text-red-500">*</span></label>
              <select {...register("semester")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="1">1 (Ganjil)</option>
                <option value="2">2 (Genap)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input type="date" {...register("tanggalMulai")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              {errors.tanggalMulai && <p className="text-red-500 text-xs mt-1">{errors.tanggalMulai.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai <span className="text-red-500">*</span></label>
              <input type="date" {...register("tanggalSelesai")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              {errors.tanggalSelesai && <p className="text-red-500 text-xs mt-1">{errors.tanggalSelesai.message}</p>}
            </div>
          </div>

          <div className="pt-2 text-sm flex gap-2">
            <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
            <label htmlFor="isActive" className="text-slate-700 font-medium cursor-pointer">Jadikan Tahun Ajaran Aktif saat ini</label>
          </div>
          <p className="text-xs text-amber-600 mb-4">*Hanya boleh ada 1 Tahun Ajaran yang aktif.</p>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">Batal</button>
            <SaveButton type="submit" status={saveStatus} />
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Simpan Tahun Ajaran?"
        description={pendingData?.isActive ? "Ini akan menonaktifkan tahun ajaran lain dan mengatur sesi aplikasi ke periode ini." : "Simpan data tahun ajaran."}
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
