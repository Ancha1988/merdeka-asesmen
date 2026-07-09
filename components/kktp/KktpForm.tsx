"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Kktp, TujuanPembelajaran } from "@/types";
import { RubrikBuilder } from "./RubrikBuilder";
import { IntervalBuilder } from "./IntervalBuilder";
import { PersentaseBuilder } from "./PersentaseBuilder";
import { DeskripsiBuilder } from "./DeskripsiBuilder";

const formSchema = z.object({
  nama: z.string().min(3, "Minimal 3 karakter"),
  deskripsi: z.string().optional(),
  bobot: z.coerce.number().min(1, "Minimal 1%").max(100, "Maksimal 100%"),
  jenis: z.enum(["deskripsi", "rubrik", "interval", "persentase"], { message: "Pilih jenis KKTP" }),
  
  // Dynamic fields (all optional at root, validation depends on selected jenis)
  indikator: z.array(z.any()).optional(),
  minKriteriaTuntas: z.coerce.number().optional(),
  rubrik: z.array(z.any()).optional(),
  interval: z.array(z.any()).optional(),
  persentase: z.any().optional(),
}).superRefine((data, ctx) => {
  if (data.jenis === "deskripsi") {
    if (!data.indikator || data.indikator.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minimal 1 indikator wajib ada", path: ["indikator"] });
    }
  } else if (data.jenis === "rubrik") {
    if (!data.rubrik || data.rubrik.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minimal 2 tingkatan rubrik wajib ada", path: ["rubrik"] });
    }
  } else if (data.jenis === "interval") {
    if (!data.interval || data.interval.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minimal 2 interval wajib ada", path: ["interval"] });
    }
  } else if (data.jenis === "persentase") {
    if (!data.persentase || !data.persentase.totalIndikator) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Total indikator wajib diisi", path: ["persentase", "totalIndikator"] });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

interface KktpFormProps {
  initialData?: Kktp;
  selectedTp: TujuanPembelajaran;
  currentTotalBobot: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function KktpForm({ initialData, selectedTp, currentTotalBobot, onSubmit, onCancel }: KktpFormProps) {
  const { register, handleSubmit, watch, control, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: initialData?.nama || "",
      deskripsi: initialData?.deskripsi || "",
      bobot: initialData?.bobot || 100 - currentTotalBobot,
      jenis: initialData?.jenis || "deskripsi",
      indikator: initialData?.indikator || [],
      minKriteriaTuntas: initialData?.minKriteriaTuntas || 1,
      rubrik: initialData?.rubrik || [],
      interval: initialData?.interval || [],
      persentase: initialData?.persentase || { totalIndikator: 10, thresholdMelebihi: 60 },
    }
  });

  const jenis = watch("jenis");
  const bobot = watch("bobot");
  const indikatorWatch = watch("indikator") || [];

  // Validate bobot threshold
  const isBobotOver = (Number(bobot) || 0) + currentTotalBobot > 100;

  const handleFormSubmit = (data: any) => {
    if (isBobotOver) return;

    // Filter dynamic fields based on jenis to avoid saving unnecessary data
    const finalData = {
      tpId: selectedTp.tpId,
      nama: data.nama,
      deskripsi: data.deskripsi || "",
      bobot: data.bobot,
      jenis: data.jenis,
      indikator: data.jenis === "deskripsi" ? data.indikator : [],
      minKriteriaTuntas: data.jenis === "deskripsi" ? Math.min(data.minKriteriaTuntas || 1, data.indikator?.length || 1) : undefined,
      rubrik: data.jenis === "rubrik" ? data.rubrik : undefined,
      interval: data.jenis === "interval" ? data.interval : undefined,
      persentase: data.jenis === "persentase" ? data.persentase : undefined,
    };

    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama KKTP */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama KKTP <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            {...register("nama")}
            placeholder="Contoh: Laporan Praktikum"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
        </div>

        {/* Jenis */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jenis KKTP <span className="text-red-500">*</span></label>
          <select 
            {...register("jenis")}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="deskripsi">Deskripsi / Ceklis</option>
            <option value="rubrik">Rubrik Deskriptif</option>
            <option value="interval">Interval Nilai</option>
            <option value="persentase">Persentase</option>
          </select>
          {errors.jenis && <p className="text-red-500 text-xs mt-1">{errors.jenis.message}</p>}
        </div>

        {/* Bobot */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bobot (%) <span className="text-red-500">*</span></label>
          <input 
            type="number"
            min="1"
            max="100"
            {...register("bobot")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${isBobotOver ? 'border-red-300 focus:ring-red-500 bg-red-50 text-red-900' : 'border-slate-300 focus:ring-blue-500'}`}
          />
          {errors.bobot && <p className="text-red-500 text-xs mt-1">{errors.bobot.message}</p>}
          {isBobotOver && <p className="text-red-500 text-xs mt-1">Total bobot melebihi 100% (saat ini: {currentTotalBobot + Number(bobot)}%)</p>}
        </div>

        {/* Deskripsi */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Tambahan (opsional)</label>
          <textarea 
            {...register("deskripsi")}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6 mt-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Pengaturan Parameter</h3>
        
        {jenis === "deskripsi" && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-md">
               <label className="block text-sm font-medium text-slate-800 mb-1">Syarat Ketuntasan Daftar Ceklis</label>
               <p className="text-xs text-slate-500 mb-3">Peserta didik dinyatakan tuntas jika mencapai jumlah minimal indikator berikut.</p>
               <div className="flex items-center gap-3">
                 <span className="text-sm text-slate-700">Minimal</span>
                 <input 
                   type="number" 
                   min="1" 
                   max={indikatorWatch.length > 0 ? indikatorWatch.length : 1}
                   {...register("minKriteriaTuntas")}
                   className="w-20 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                 />
                 <span className="text-sm text-slate-700">Kriteria Tercapai (dari total {indikatorWatch.length} kriteria)</span>
               </div>
            </div>
            <Controller
              name="indikator"
              control={control}
              render={({ field }) => (
                <DeskripsiBuilder 
                  items={field.value || []} 
                  onChange={field.onChange} 
                  tpIndikator={selectedTp.indikator}
                  error={errors.indikator?.message as string}
                />
              )}
            />
          </div>
        )}

        {jenis === "rubrik" && (
          <Controller
            name="rubrik"
            control={control}
            render={({ field }) => (
              <RubrikBuilder items={field.value || []} onChange={field.onChange} error={errors.rubrik?.message as string} tpIndikator={selectedTp.indikator} />
            )}
          />
        )}

        {jenis === "interval" && (
          <Controller
            name="interval"
            control={control}
            render={({ field }) => (
              <IntervalBuilder items={field.value || []} onChange={field.onChange} error={errors.interval?.message as string} />
            )}
          />
        )}

        {jenis === "persentase" && (
          <Controller
            name="persentase"
            control={control}
            render={({ field }) => (
              <PersentaseBuilder value={field.value} onChange={field.onChange} error={errors.persentase?.message as string} />
            )}
          />
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isBobotOver}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Simpan KKTP
        </button>
      </div>

    </form>
  )
}
