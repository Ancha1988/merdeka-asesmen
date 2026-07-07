"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sekolah } from "@/types";
import { SaveButton } from "@/components/shared/SaveButton";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { JENJANG_SEKOLAH } from "@/lib/constants";
import { generateId } from "@/lib/utils";

const sekolahSchema = z.object({
  nama: z.string().min(1, "Nama Sekolah wajib diisi"),
  jenjang: z.enum(["PAUD", "SD", "SMP", "SMA", "SMK", "PK"]),
  npsn: z.string().length(8, "NPSN harus 8 digit angka").regex(/^\d+$/, "Hanya boleh angka"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  kepsek: z.string().min(1, "Nama Kepala Sekolah wajib diisi"),
  nipKepsek: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email("Format email salah").or(z.literal("")),
});

type SekolahFormValues = z.infer<typeof sekolahSchema>;

interface SekolahFormProps {
  initialData: Sekolah | null;
  onSave: (data: Sekolah) => void;
}

export function SekolahForm({ initialData, onSave }: SekolahFormProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success">("idle");
  const [pendingData, setPendingData] = useState<SekolahFormValues | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SekolahFormValues>({
    resolver: zodResolver(sekolahSchema),
    defaultValues: {
      nama: initialData?.nama || "",
      jenjang: initialData?.jenjang || "SD",
      npsn: initialData?.npsn || "",
      alamat: initialData?.alamat || "",
      kepsek: initialData?.kepsek || "",
      nipKepsek: initialData?.nipKepsek || "",
      telepon: initialData?.telepon || "",
      email: initialData?.email || "",
    },
  });

  const onSubmit = (data: SekolahFormValues) => {
    setPendingData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!pendingData) return;
    setIsConfirmOpen(false);
    setSaveStatus("loading");
    
    // Simulate slight delay
    setTimeout(() => {
      const sekolahData: Sekolah = {
        sekolahId: initialData?.sekolahId || generateId(),
        ...pendingData,
        nipKepsek: pendingData.nipKepsek || "",
        telepon: pendingData.telepon || "",
        email: pendingData.email || "",
        logoUrl: initialData?.logoUrl || null,
        isActive: true,
      };
      
      onSave(sekolahData);
      setSaveStatus("success");
      ToastNotifier.success("Data sekolah berhasil disimpan!");
      
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sekolah <span className="text-red-500">*</span></label>
              <input type="text" {...register("nama")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jenjang <span className="text-red-500">*</span></label>
                <select {...register("jenjang")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {JENJANG_SEKOLAH.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                {errors.jenjang && <p className="text-red-500 text-xs mt-1">{errors.jenjang.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NPSN <span className="text-red-500">*</span></label>
                <input type="text" {...register("npsn")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.npsn && <p className="text-red-500 text-xs mt-1">{errors.npsn.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat <span className="text-red-500">*</span></label>
              <textarea {...register("alamat")} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kepala Sekolah <span className="text-red-500">*</span></label>
              <input type="text" {...register("kepsek")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.kepsek && <p className="text-red-500 text-xs mt-1">{errors.kepsek.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input type="text" {...register("nipKepsek")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
                <input type="text" {...register("telepon")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" {...register("email")} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <SaveButton type="submit" status={saveStatus} />
        </div>
      </form>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Simpan Profil Sekolah?"
        description="Pastikan data seperti NPSN dan Nama Sekolah sudah benar karena akan digunakan di dokumen penamaan dan rapor."
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
