"use client";

import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { Murid, Kelas } from "@/types";
import { Loader2, Plus, Users, Search } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { MuridForm } from "@/components/pengaturan/murid/MuridForm";
import { PindahKelasModal, MutasiModal, RiwayatTimeline } from "@/components/pengaturan/murid/MuridModals";
import { NaikKelasModal } from "@/components/pengaturan/murid/NaikKelasModal";
import { ImportMuridModal } from "@/components/pengaturan/murid/ImportMuridModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { AlertCircle, Upload } from "lucide-react";

export default function MuridPage() {
  const { murid, kelas, tahunAjaran, updateMurid, isLoading } = useMasterData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNaikKelasOpen, setIsNaikKelasOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingData, setEditingData] = useState<Murid | undefined>(undefined);
  
  const [pindahTarget, setPindahTarget] = useState<Murid | null>(null);
  const [mutasiTarget, setMutasiTarget] = useState<Murid | null>(null);
  const [riwayatTarget, setRiwayatTarget] = useState<Murid | null>(null);
  
  const [filterStatus, setFilterStatus] = useState<"aktif" | "arsip">("aktif");

  const activeTA = tahunAjaran.find(t => t.isActive);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!activeTA) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Data Murid</h1>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl flex gap-4">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <p className="text-sm">Anda harus mengatur Tahun Ajaran terlebih dahulu.</p>
        </div>
      </div>
    );
  }
  
  const activeClasses = kelas.filter(k => k.tahunId === activeTA.tahunId);

  const handleSaveMurid = (data: Murid) => {
    let updated = [...murid];
    const index = updated.findIndex(m => m.muridId === data.muridId);
    if (index >= 0) updated[index] = data;
    else updated.push(data);
    updateMurid(updated);
    setIsFormOpen(false);
    setPindahTarget(null);
    setMutasiTarget(null);
  };

  const getKelasName = (kId: string | null) => {
    if (!kId) return "-";
    const k = kelas.find(k => k.kelasId === kId);
    return k ? k.namaKelas : "Unknown";
  };

  const filteredMurid = filterStatus === "aktif" 
    ? murid.filter(m => m.status === "aktif")
    : murid.filter(m => m.status !== "aktif");

  const columns: Column<Murid>[] = [
    { header: "NISN", accessorKey: "nisn" },
    { header: "Nama Lengkap", accessorKey: "nama" },
    { header: "L/P", accessorKey: "jenisKelamin" },
    { 
      header: "Kelas", 
      cell: (item) => getKelasName(item.kelasId) 
    },
    { 
      header: "Status", 
      cell: (item) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${item.status === 'aktif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {item.status.toUpperCase()}
        </span>
      )
    },
    {
      header: "Aksi Lain",
      cell: (item) => (
        item.status === "aktif" && (
          <div className="flex gap-2">
            <button onClick={() => setPindahTarget(item)} className="text-xs text-blue-600 hover:underline">Pindah</button>
            <button onClick={() => setMutasiTarget(item)} className="text-xs text-red-600 hover:underline">Mutasi</button>
            <button onClick={() => setRiwayatTarget(item)} className="text-xs text-slate-500 hover:underline">Riwayat</button>
          </div>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Murid</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data peserta didik.</p>
        </div>
        <div className="flex items-center gap-3">
          {filterStatus === "aktif" && (
             <button 
               onClick={() => setIsNaikKelasOpen(true)}
               className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-emerald-700"
             >
               Naik Kelas Massal
             </button>
          )}
          <select 
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "aktif"|"arsip")}
            className="border border-slate-300 rounded text-sm px-3 py-2 bg-white"
          >
            <option value="aktif">Murid Aktif</option>
            <option value="arsip">Arsip (Mutasi/Lulus)</option>
          </select>
          <button 
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-100 border border-slate-300 text-slate-700 px-4 py-2 rounded font-medium text-sm hover:bg-slate-200"
          >
            <Upload className="w-4 h-4" /> Impor Klasikal
          </button>
          <button 
            onClick={() => { setEditingData(undefined); setIsFormOpen(true); }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Tambah Murid
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {filteredMurid.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title={`Tidak ada murid ${filterStatus}`} 
            description={filterStatus === "aktif" ? "Mulai tambahkan atau pindahkan murid." : ""}
          />
        ) : (
          <DataTable 
            data={filteredMurid} 
            columns={columns} 
            onEdit={filterStatus === "aktif" ? (item) => { setEditingData(item); setIsFormOpen(true); } : undefined} 
            searchKey="nama"
          />
        )}
      </div>

      {isNaikKelasOpen && (
        <NaikKelasModal
          muridList={murid}
          kelasList={kelas}
          tahunAjaranList={tahunAjaran}
          activeTahun={activeTA}
          onSave={(newList) => {
            updateMurid(newList);
            setIsNaikKelasOpen(false);
          }}
          onCancel={() => setIsNaikKelasOpen(false)}
        />
      )}

      {isImportOpen && (
        <ImportMuridModal
           kelasList={activeClasses}
           tahunAjaranAktif={activeTA}
           onSave={(newData) => {
             updateMurid([...murid, ...newData]);
             setIsImportOpen(false);
           }}
           onCancel={() => setIsImportOpen(false)}
        />
      )}

      {isFormOpen && (
        <MuridForm 
          initialData={editingData} 
          kelasList={activeClasses}
          tahunAjaranList={tahunAjaran}
          activeTahun={activeTA}
          onSave={handleSaveMurid} 
          onCancel={() => { setIsFormOpen(false); setEditingData(undefined); }} 
        />
      )}

      {pindahTarget && (
        <PindahKelasModal 
          murid={pindahTarget} 
          kelasList={activeClasses} 
          activeTahun={activeTA} 
          onSave={handleSaveMurid} 
          onCancel={() => setPindahTarget(null)} 
        />
      )}

      {mutasiTarget && (
        <MutasiModal 
          murid={mutasiTarget} 
          onSave={handleSaveMurid} 
          onCancel={() => setMutasiTarget(null)} 
        />
      )}

      {riwayatTarget && (
         <RiwayatTimeline
          murid={riwayatTarget}
          kelasList={kelas}
          tahunList={tahunAjaran}
          onCancel={() => setRiwayatTarget(null)}
         />
      )}
    </div>
  );
}
