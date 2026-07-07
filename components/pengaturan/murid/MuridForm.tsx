"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Murid, Kelas, TahunAjaran } from "@/types";
import { SaveButton } from "@/components/shared/SaveButton";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { generateId } from "@/lib/utils";

const muridSchema = z.object({
  nisn: z.string().min(1, "NISN wajib diisi").regex(/^\d+$/, "NISN hanya boleh angka"),
  nama: z.string().min(1, "Nama Lengkap wajib diisi"),
  jenisKelamin: z.enum(["L", "P"]),
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
  noHpOrtu: z.string().optional(),
  tahunMasuk: z.string().min(1, "Tahun Masuk wajib dipilih"),
});

type MuridFormValues = z.infer<typeof muridSchema>;

interface MuridFormProps {
  initialData?: Murid;
  kelasList: Kelas[];
  tahunAjaranList: TahunAjaran[];
  activeTahun: TahunAjaran;
  onSave: (data: Murid) => void;
  onCancel: () => void;
}

export function MuridForm({ initialData, kelasList, tahunAjaranList, activeTahun, onSave, onCancel }: MuridFormProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success">("idle");
  const [pendingData, setPendingData] = useState<MuridFormValues | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<MuridFormValues>({
    resolver: zodResolver(muridSchema),
    defaultValues: {
      nisn: initialData?.nisn || "",
      nama: initialData?.nama || "",
      jenisKelamin: initialData?.jenisKelamin || undefined,
      kelasId: initialData?.kelasId || "",
      noHpOrtu: initialData?.noHpOrtu || "",
      tahunMasuk: initialData?.tahunMasuk || activeTahun.tahunId,
    },
  });

  const onSubmit = (data: MuridFormValues) => {
    setPendingData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!pendingData) return;
    setIsConfirmOpen(false);
    setSaveStatus("loading");
    
    setTimeout(() => {
      let murid: Murid;

      if (initialData) {
        // Mode Edit: check if class changed
        murid = { 
          ...initialData, 
          ...pendingData,
          noHpOrtu: pendingData.noHpOrtu || null 
        };
      } else {
        // Mode Create
        murid = {
          muridId: generateId(),
          ...pendingData,
          noHpOrtu: pendingData.noHpOrtu || null,
          status: "aktif",
          riwayatKelas: [
            {
              kelasId: pendingData.kelasId,
              tahunId: activeTahun.tahunId,
              tanggalMasuk: new Date().toISOString(),
              tanggalKeluar: null,
              alasan: "pendaftaran_awal"
            }
          ]
        };
      }
      
      onSave(murid);
      setSaveStatus("success");
      ToastNotifier.success(`Data murid ${murid.nama} tersimpan!`);
      setTimeout(() => setSaveStatus("idle"), 1000);
    }, 500);
  };

  const currentYearClasses = kelasList.filter(k => k.tahunId === activeTahun.tahunId);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialData ? "Edit Murid" : "Tambah Murid"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NISN <span className="text-red-500">*</span></label>
              <input type="text" {...register("nisn")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              {errors.nisn && <p className="text-red-500 text-xs mt-1">{errors.nisn.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Masuk <span className="text-red-500">*</span></label>
              <select {...register("tahunMasuk")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="">-- Pilih --</option>
                {tahunAjaranList.map(ta => (
                  <option key={ta.tahunId} value={ta.tahunId}>{ta.tahun}</option>
                ))}
              </select>
              {errors.tahunMasuk && <p className="text-red-500 text-xs mt-1">{errors.tahunMasuk.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" {...register("nama")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin <span className="text-red-500">*</span></label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                  <input type="radio" value="L" {...register("jenisKelamin")} className="mr-2 text-blue-600 focus:ring-blue-500" />
                  Laki-Laki
                </label>
                <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                  <input type="radio" value="P" {...register("jenisKelamin")} className="mr-2 text-blue-600 focus:ring-blue-500" />
                  Perempuan
                </label>
              </div>
              {errors.jenisKelamin && <p className="text-red-500 text-xs mt-1">{errors.jenisKelamin.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kelas Saat Ini <span className="text-red-500">*</span></label>
              <select {...register("kelasId")} disabled={!!initialData} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-100 disabled:text-slate-500">
                <option value="">-- Pilih Kelas T.A Aktif --</option>
                {currentYearClasses.map(k => (
                  <option key={k.kelasId} value={k.kelasId}>{k.namaKelas}</option>
                ))}
              </select>
              {errors.kelasId && <p className="text-red-500 text-xs mt-1">{errors.kelasId.message}</p>}
              {initialData && <p className="text-xs text-slate-500 mt-1">Gunakan fitur &quot;Pindah Kelas&quot; untuk memindah.</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No HP Orang Tua</label>
            <input type="text" placeholder="08xxxxxxxxxx" {...register("noHpOrtu")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
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
        title="Simpan Data Murid?"
        description="Simpan data murid ke sistem."
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
