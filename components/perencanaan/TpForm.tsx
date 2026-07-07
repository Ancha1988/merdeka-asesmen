"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TujuanPembelajaran, Kelas } from "@/types";
import { FASE_SEKOLAH } from "@/lib/constants";
import { DimensiSelector } from "./DimensiSelector";
import { IndikatorInput } from "./IndikatorInput";

const formSchema = z.object({
  fase: z.enum(["A", "B", "C", "D", "E"], { message: "Pilih fase" }),
  kelasTargetIds: z.array(z.string()).min(1, "Pilih minimal 1 kelas target"),
  kompetensi: z.string().min(10, "Minimal 10 karakter"),
  lingkupMateri: z.string().min(10, "Minimal 10 karakter"),
  indikator: z.array(z.string().min(5, "Minimal 5 karakter")).min(1, "Minimal 1 indikator"),
  dimensiIds: z.array(z.string()).min(1, "Pilih minimal 1 dimensi").max(8, "Maksimal 8 dimensi"),
  urutan: z.coerce.number().min(1, "Minimal 1"),
  alokasiWaktu: z.coerce.number().min(1, "Minimal 1"),
});

type FormValues = z.infer<typeof formSchema>;

interface TpFormProps {
  initialData?: TujuanPembelajaran;
  availableClasses: Kelas[];
  maxExistingUrutan: number;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

export function TpForm({ initialData, availableClasses, maxExistingUrutan, onSubmit, onCancel }: TpFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fase: initialData?.fase || "A",
      kelasTargetIds: initialData?.kelasTargetIds || [],
      kompetensi: initialData?.kompetensi || "",
      lingkupMateri: initialData?.lingkupMateri || "",
      indikator: initialData?.indikator?.length ? initialData.indikator : [""],
      dimensiIds: initialData?.dimensiIds || [],
      urutan: initialData?.urutan || maxExistingUrutan + 1,
      alokasiWaktu: initialData?.alokasiWaktu || 1,
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fase */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fase <span className="text-red-500">*</span></label>
          <select 
            {...register("fase")}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FASE_SEKOLAH.map(f => (
              <option key={f} value={f}>Fase {f}</option>
            ))}
          </select>
          {errors.fase && <p className="text-red-500 text-xs mt-1">{errors.fase.message}</p>}
        </div>

        {/* Urutan */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Urutan (ATP) <span className="text-red-500">*</span></label>
          <input 
            type="number" 
            min="1"
            {...register("urutan")}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.urutan && <p className="text-red-500 text-xs mt-1">{errors.urutan.message}</p>}
        </div>
      </div>

      {/* Kelas Target Multi Select */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Kelas Target <span className="text-red-500">*</span></label>
        <p className="text-xs text-slate-500 mb-2">Tahan CTRL/CMD untuk memilih lebih dari satu.</p>
        <select 
          multiple
          {...register("kelasTargetIds")}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        >
          {availableClasses.map(k => (
            <option key={k.kelasId} value={k.kelasId}>{k.namaKelas} (Tingkat {k.tingkat})</option>
          ))}
        </select>
        {errors.kelasTargetIds && <p className="text-red-500 text-xs mt-1">{errors.kelasTargetIds.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kompetensi */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kompetensi <span className="text-red-500">*</span></label>
          <textarea 
            {...register("kompetensi")}
            placeholder="Contoh: Murid mampu menjelaskan..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.kompetensi && <p className="text-red-500 text-xs mt-1">{errors.kompetensi.message}</p>}
        </div>

        {/* Lingkup Materi */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lingkup Materi <span className="text-red-500">*</span></label>
          <textarea 
            {...register("lingkupMateri")}
            placeholder="Contoh: Pecahan, desimal, persen..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.lingkupMateri && <p className="text-red-500 text-xs mt-1">{errors.lingkupMateri.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Alokasi Waktu (JP) <span className="text-red-500">*</span></label>
        <input 
          type="number" 
          min="1"
          {...register("alokasiWaktu")}
          className="w-full md:w-1/3 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.alokasiWaktu && <p className="text-red-500 text-xs mt-1">{errors.alokasiWaktu.message}</p>}
      </div>

      {/* Indikator */}
      <Controller
        name="indikator"
        control={control}
        render={({ field }) => (
          <IndikatorInput 
            items={field.value} 
            onChange={field.onChange} 
            error={errors.indikator?.message || (errors.indikator as any)?.root?.message}
          />
        )}
      />

      {/* Dimensi Profil */}
      <Controller
        name="dimensiIds"
        control={control}
        render={({ field }) => (
          <DimensiSelector 
            selectedIds={field.value} 
            onChange={field.onChange} 
            error={errors.dimensiIds?.message}
          />
        )}
      />
      
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Simpan Tujuan Pembelajaran
        </button>
      </div>
    </form>
  )
}
