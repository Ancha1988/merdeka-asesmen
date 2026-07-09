"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { useMasterData } from "@/hooks/useMasterData";
import { usePresensi } from "@/hooks/usePresensi";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

const statusList = [
  { value: "HADIR", label: "Hadir", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "SAKIT", label: "Sakit", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "IZIN", label: "Izin", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "ALPA", label: "Alpa", color: "bg-red-100 text-red-800 border-red-300" },
  { value: "BOLOS", label: "Bolos", color: "bg-red-200 text-red-900 border-red-400 line-through" },
] as const;

const presensiSchema = z.object({
  tahunId: z.string().min(1, "Pilih tahun ajaran"),
  kelasId: z.string().min(1, "Pilih kelas"),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal salah"),
  muridPresensi: z.array(z.object({
    muridId: z.string(),
    status: z.enum(["HADIR", "SAKIT", "IZIN", "ALPA", "BOLOS"]),
    catatanKehadiran: z.string().max(200, "Maks 200 karakter").optional().nullable(),
    catatanSikap: z.string().max(200, "Maks 200 karakter").optional().nullable(),
    catatanAkademik: z.string().max(200, "Maks 200 karakter").optional().nullable(),
  })).min(1, "Minimal 1 murid")
});

type PresensiFormValues = z.infer<typeof presensiSchema>;

export default function InputPresensiPage() {
  const { tahunAjaranAktif } = useAppStore();
  const { kelas, murid, isLoading: isMasterLoading } = useMasterData();
  const { presensiData, savePresensi, isLoading: isPresensiLoading } = usePresensi();

  const [selectedKelasId, setSelectedKelasId] = useState("");
  const [selectedTanggal, setSelectedTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [confirmData, setConfirmData] = useState<PresensiFormValues | null>(null);

  const form = useForm<PresensiFormValues>({
    resolver: zodResolver(presensiSchema),
    defaultValues: {
      tahunId: tahunAjaranAktif?.tahunId || "",
      kelasId: "",
      tanggal: selectedTanggal,
      muridPresensi: []
    }
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "muridPresensi"
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update default tahunId if changes
  useEffect(() => {
    if (tahunAjaranAktif?.tahunId && isMounted) {
      form.setValue("tahunId", tahunAjaranAktif.tahunId);
    }
  }, [tahunAjaranAktif, isMounted, form]);

  useEffect(() => {
    if (selectedKelasId && isMounted) {
      form.setValue("kelasId", selectedKelasId);
    }
    if (isMounted) {
      form.setValue("tanggal", selectedTanggal);
    }
  }, [selectedKelasId, selectedTanggal, isMounted, form]);

  // Handle available classes for active year
  const availableKelas = kelas.filter(k => k.tahunId === tahunAjaranAktif?.tahunId);

  // Load murid for selected class & initialize form array
  useEffect(() => {
    let isSubscribed = true;

    if (selectedKelasId && tahunAjaranAktif) {
      // Find active students in that class
      const targetMurids = murid
        .filter(m => m.kelasId === selectedKelasId && m.status === "aktif")
        .sort((a, b) => a.nama.localeCompare(b.nama));

      // check if we already have records
      const existingRecord = presensiData.find(
        p => p.tahunId === tahunAjaranAktif.tahunId && p.kelasId === selectedKelasId && p.tanggal === selectedTanggal
      );

      const items = targetMurids.map(m => {
        const ext = existingRecord?.muridPresensi.find((em: any) => em.muridId === m.muridId);
        return {
          muridId: m.muridId,
          status: ext ? ext.status : "HADIR" as const,
          catatanKehadiran: ext?.catatanKehadiran || "",
          catatanSikap: ext?.catatanSikap || "",
          catatanAkademik: ext?.catatanAkademik || ""
        };
      });

      if (isSubscribed) {
        replace(items);
      }
    } else {
      if (isSubscribed) {
        replace([]);
      }
    }

    return () => { isSubscribed = false; };
  }, [selectedKelasId, selectedTanggal, murid, presensiData, tahunAjaranAktif, replace]);


  if (!isMounted || isMasterLoading || isPresensiLoading) {
    return <div className="p-6">Memuat data...</div>;
  }

  if (!tahunAjaranAktif) {
    return <div className="p-6">Harap aktifkan Tahun Ajaran di Pengaturan terlebih dahulu.</div>;
  }

  const onSubmit = (data: PresensiFormValues) => {
    setConfirmData(data);
  };

  const handleConfirmedSave = () => {
    if (!confirmData) return;
    const { tahunId, kelasId, tanggal, muridPresensi } = confirmData;
    
    // Convert nulls to undefined or just keep them string to match PresensiHarian type
    const cleanedMurid = muridPresensi.map(mp => ({
      ...mp,
      catatanKehadiran: mp.catatanKehadiran || undefined,
      catatanSikap: mp.catatanSikap || undefined,
      catatanAkademik: mp.catatanAkademik || undefined
    }));

    savePresensi({
      id: `prs-${tahunId}-${kelasId}-${tanggal}`,
      tahunId,
      kelasId,
      tanggal,
      muridPresensi: cleanedMurid
    });
    
    ToastNotifier.success("Data presensi berhasil disimpan");
    setConfirmData(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Input Presensi Harian</h1>
        <p className="text-sm text-slate-500">Kelola daftar kehadiran siswa dan catatan anekdot harian.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Kelas</label>
          <select
            className="w-48 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedKelasId}
            onChange={e => setSelectedKelasId(e.target.value)}
          >
            <option value="">-- Pilih Kelas --</option>
            {availableKelas.map(k => (
              <option key={k.kelasId} value={k.kelasId}>{k.namaKelas}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
          <input
            type="date"
            className="w-40 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTanggal}
            onChange={e => setSelectedTanggal(e.target.value)}
          />
        </div>
      </div>

      {selectedKelasId && fields.length > 0 && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm object-contain font-semibold text-slate-700">
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">NPD / NISN</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3 w-12 text-center">L/P</th>
                  <th className="px-4 py-3 min-w-[340px]">Status Kehadiran</th>
                  <th className="px-4 py-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fields.map((field, index) => {
                  const m = murid.find(x => x.muridId === field.muridId);
                  return (
                    <MuridRow 
                      key={field.id} 
                      index={index} 
                      muridInfo={m} 
                      control={form.control} 
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end sticky bottom-0 z-10">
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
            >
              Simpan Presensi
            </button>
          </div>
        </form>
      )}

      {selectedKelasId && fields.length === 0 && (
        <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-lg bg-slate-50">
          Belum ada murid aktif di kelas ini.
        </div>
      )}

      {confirmData && (
        <ConfirmDialog 
          isOpen={true}
          title="Simpan Data Presensi"
          description={`Simpan presensi tanggal ${selectedTanggal} untuk kelas ${kelas.find(k => k.kelasId === confirmData.kelasId)?.namaKelas}? Data akan ditimpa jika sudah ada.`}
          onConfirm={handleConfirmedSave}
          onCancel={() => setConfirmData(null)}
          confirmLabel="Simpan"
        />
      )}
    </div>
  );
}

function MuridRow({ index, muridInfo, control }: { index: number, muridInfo: any, control: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-4 py-3 text-center align-top pt-5 text-sm text-slate-500">{index + 1}</td>
        <td className="px-4 py-3 align-top pt-5">
          <div className="text-sm font-medium text-slate-800">{muridInfo?.nisn || "-"}</div>
        </td>
        <td className="px-4 py-3 align-top pt-5">
          <div className="text-sm font-semibold text-slate-800">{muridInfo?.nama || "-"}</div>
        </td>
        <td className="px-4 py-3 text-center align-top pt-5">
          <div className="text-xs font-bold text-slate-500">{muridInfo?.jenisKelamin === "Laki-laki" ? "L" : "P"}</div>
        </td>
        <td className="px-4 py-3 align-top pt-4">
          <Controller 
            control={control}
            name={`muridPresensi.${index}.status`}
            render={({ field }) => (
              <div className="flex gap-2 flex-wrap">
                {statusList.map(st => (
                  <label 
                    key={st.value} 
                    className={`
                      cursor-pointer px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all
                      ${field.value === st.value 
                        ? st.color + " ring-2 ring-offset-1 " + (st.value === 'BOLOS' ? 'ring-red-500 ' : 'ring-inherit opacity-100 shadow-sm ')
                        : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100 opacity-80'}
                    `}
                  >
                    <input 
                      type="radio" 
                      className="sr-only" 
                      checked={field.value === st.value}
                      onChange={() => field.onChange(st.value)}
                    />
                    {st.value === 'BOLOS' && field.value === st.value && <AlertCircle className="w-3 h-3" />}
                    {st.label}
                  </label>
                ))}
              </div>
            )}
          />
        </td>
        <td className="px-4 py-3 align-top pt-4 text-center">
          <button 
            type="button" 
            onClick={() => setExpanded(!expanded)}
            className={`p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition ${expanded ? 'bg-slate-200 text-blue-600' : ''}`}
            title="Catatan Anekdot (Opsional)"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/50">
          <td colSpan={6} className="px-4 pb-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-12 border-l-2 border-slate-200 ml-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Kehadiran</label>
                <Controller 
                  control={control}
                  name={`muridPresensi.${index}.catatanKehadiran`}
                  render={({ field }) => (
                    <textarea 
                      {...field}
                      rows={2}
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500 placeholder:italic"
                      placeholder="Datang terlambat 15 menit..."
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Sikap</label>
                <Controller 
                  control={control}
                  name={`muridPresensi.${index}.catatanSikap`}
                  render={({ field }) => (
                    <textarea 
                      {...field}
                      rows={2}
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500 placeholder:italic"
                      placeholder="Bersikap proaktif..."
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Akademik</label>
                <Controller 
                  control={control}
                  name={`muridPresensi.${index}.catatanAkademik`}
                  render={({ field }) => (
                    <textarea 
                      {...field}
                      rows={2}
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500 placeholder:italic"
                      placeholder="Aktif bertanya..."
                    />
                  )}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
