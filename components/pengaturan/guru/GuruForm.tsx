"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Guru, Kelas } from "@/types";
import { SaveButton } from "@/components/shared/SaveButton";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { generateId } from "@/lib/utils";

const guruSchema = z.object({
  nama: z.string().min(1, "Nama Lengkap wajib diisi"),
  email: z.string().email("Format email salah"),
  nip: z.string().optional(),
  role: z.enum(["guru", "koordinator", "kepsek"]),
  kelasDiampu: z.array(z.string()),
  isActive: z.boolean()
});

type GuruFormValues = z.infer<typeof guruSchema>;

interface GuruFormProps {
  initialData?: Guru;
  kelasList: Kelas[];
  existingGuru: Guru[];
  onSave: (data: Guru) => void;
  onCancel: () => void;
}

export function GuruForm({ initialData, kelasList, existingGuru, onSave, onCancel }: GuruFormProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success">("idle");
  const [pendingData, setPendingData] = useState<GuruFormValues | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<GuruFormValues>({
    resolver: zodResolver(guruSchema),
    defaultValues: {
      nama: initialData?.nama || "",
      email: initialData?.email || "",
      nip: initialData?.nip || "",
      role: initialData?.role || "guru",
      kelasDiampu: initialData?.kelasDiampu || [],
      isActive: initialData !== undefined ? initialData.isActive : true,
    },
  });

  const selectedClasses = watch("kelasDiampu");
  const role = watch("role");

  const toggleClass = (kelasId: string) => {
    if (selectedClasses.includes(kelasId)) {
      setValue("kelasDiampu", selectedClasses.filter(id => id !== kelasId));
    } else {
      setValue("kelasDiampu", [...selectedClasses, kelasId]);
    }
  };

  const onSubmit = (data: GuruFormValues) => {
    // Validasi 1 kepsek
    if (data.role === "kepsek") {
      const existingKepsek = existingGuru.find(g => g.role === "kepsek" && g.uid !== initialData?.uid);
      if (existingKepsek) {
        ToastNotifier.error("Sudah ada Kepala Sekolah terdaftar.");
        return;
      }
    }
    
    setPendingData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!pendingData) return;
    setIsConfirmOpen(false);
    setSaveStatus("loading");
    
    setTimeout(() => {
      const data: Guru = {
        uid: initialData?.uid || generateId(),
        ...pendingData,
        nip: pendingData.nip || null,
      };
      
      onSave(data);
      setSaveStatus("success");
      ToastNotifier.success(`Data guru ${data.nama} tersimpan!`);
      setTimeout(() => setSaveStatus("idle"), 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialData ? "Edit Data Guru" : "Tambah Data Guru"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          <form id="guru-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <input type="text" {...register("nama")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" placeholder="guru@sekolah.com" {...register("email")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIP (Opsional)</label>
                <input type="text" {...register("nip")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role/Peran <span className="text-red-500">*</span></label>
                <select {...register("role")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="guru">Guru</option>
                  <option value="koordinator">Koordinator Kurikulum</option>
                  <option value="kepsek">Kepala Sekolah</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" {...register("isActive")} className="w-4 h-4 text-blue-600 rounded border-slate-300 mr-2" />
                  Status Aktif
                </label>
              </div>
            </div>

            {role === "guru" && (
              <div className="mt-4 border-t pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Kelas Diampu (Opsional)</label>
                {kelasList.length === 0 ? (
                  <p className="text-xs text-slate-500">Belum ada kelas yang terdaftar di konfigurasi.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {kelasList.map(kls => (
                      <label key={kls.kelasId} className="flex items-center gap-2 cursor-pointer border border-slate-200 p-2 rounded text-sm hover:bg-slate-50">
                        <input 
                          type="checkbox" 
                          checked={selectedClasses.includes(kls.kelasId)}
                          onChange={() => toggleClass(kls.kelasId)}
                          className="rounded text-blue-600"
                        />
                        <span className="truncate" title={kls.namaKelas}>{kls.namaKelas}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-white transition-colors">Batal</button>
          <SaveButton form="guru-form" type="submit" status={saveStatus} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Simpan Data Guru?"
        description="Data guru akan disimpan. (Autentikasi Firebase belum terhubung)"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
