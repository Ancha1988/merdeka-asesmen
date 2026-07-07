"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { useMasterData } from "@/hooks/useMasterData";
import { FASE_SEKOLAH, DIMENSI_PROFIL } from "@/lib/constants";
import { TujuanPembelajaran } from "@/types";
import { TpForm } from "@/components/perencanaan/TpForm";
import { TpCard } from "@/components/perencanaan/TpCard";
import { AtpBuilder } from "@/components/perencanaan/AtpBuilder";
import { DataTable } from "@/components/shared/DataTable";
import * as Dialog from "@radix-ui/react-dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ToastNotifier } from "@/components/shared/ToastNotifier";

export default function PerencanaanPage() {
  const { tp, updateTp, kelas } = useMasterData();
  const [faseFilter, setFaseFilter] = useState("A");
  const [viewMode, setViewMode] = useState<"card" | "table" | "atp">("table");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTp, setEditingTp] = useState<TujuanPembelajaran | undefined>();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [tpToDelete, setTpToDelete] = useState<TujuanPembelajaran | null>(null);

  // Filter TPs based on selected fase
  const filteredTp = (tp || []).filter(t => t.fase === faseFilter);

  // Available classes for form inside active phase
  // Actually, TpForm can show all classes or just those for the active phase?
  // Let's just pass all classes
  
  const handleSave = (data: any) => {
    const newGlobalTp = [...(tp || [])];
    
    if (editingTp) {
      const index = newGlobalTp.findIndex(t => t.tpId === editingTp.tpId);
      if (index !== -1) {
        newGlobalTp[index] = {
          ...editingTp,
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
      ToastNotifier.success("Tujuan Pembelajaran berhasil diperbarui.");
    } else {
      newGlobalTp.push({
        ...data,
        tpId: `tp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      ToastNotifier.success("Tujuan Pembelajaran berhasil ditambahkan.");
    }
    
    updateTp(newGlobalTp);
    setIsFormOpen(false);
    setEditingTp(undefined);
  };

  const handleEdit = (item: TujuanPembelajaran) => {
    setEditingTp(item);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (item: TujuanPembelajaran) => {
    setTpToDelete(item);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tpToDelete) {
      const newGlobalTp = (tp || []).filter(t => t.tpId !== tpToDelete.tpId);
      updateTp(newGlobalTp);
      ToastNotifier.success("Tujuan Pembelajaran berhasil dihapus.");
    }
    setIsConfirmDeleteOpen(false);
    setTpToDelete(null);
  };

  const getKelasNames = (kelasIds: string[]) => {
    return kelasIds
      .map(id => kelas.find(k => k.kelasId === id)?.namaKelas || "Unknown")
      .join(", ");
  };

  // Table Columns
  const tableColumns = [
    {
      header: "Urutan",
      accessorKey: "urutan" as keyof TujuanPembelajaran,
      cell: (item: TujuanPembelajaran) => (
        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
          {item.urutan}
        </span>
      )
    },
    {
      header: "Kompetensi",
      accessorKey: "kompetensi" as keyof TujuanPembelajaran,
      cell: (item: TujuanPembelajaran) => (
        <div className="max-w-xs truncate" title={item.kompetensi}>{item.kompetensi}</div>
      )
    },
    {
      header: "Lingkup Materi",
      accessorKey: "lingkupMateri" as keyof TujuanPembelajaran,
      cell: (item: TujuanPembelajaran) => (
        <div className="max-w-xs truncate" title={item.lingkupMateri}>{item.lingkupMateri}</div>
      )
    },
    {
      header: "Kelas",
      accessorKey: "kelasTargetIds" as keyof TujuanPembelajaran,
      cell: (item: TujuanPembelajaran) => getKelasNames(item.kelasTargetIds)
    },
    {
      header: "JP",
      accessorKey: "alokasiWaktu" as keyof TujuanPembelajaran,
    }
  ];

  const maxExistingUrutan = Math.max(0, ...filteredTp.map(t => t.urutan || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Perencanaan Pembelajaran</h1>
          <p className="text-slate-500">Kelola Tujuan Pembelajaran (TP) dan Alur Tujuan Pembelajaran (ATP)</p>
        </div>
        
        <button
          onClick={() => { setEditingTp(undefined); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Tambah TP
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Fase:</label>
          <select 
            value={faseFilter}
            onChange={(e) => setFaseFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          >
            {FASE_SEKOLAH.map(f => (
              <option key={f} value={f}>Fase {f}</option>
            ))}
          </select>
        </div>

        {/* View Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 text-sm font-medium rounded-sm flex items-center gap-1.5 transition-colors ${
              viewMode === "table" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List className="w-4 h-4" /> Tabel
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`px-3 py-1.5 text-sm font-medium rounded-sm flex items-center gap-1.5 transition-colors ${
              viewMode === "card" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
          <button
            onClick={() => setViewMode("atp")}
            className={`px-3 py-1.5 text-sm font-medium rounded-sm flex items-center gap-1.5 transition-colors ${
              viewMode === "atp" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Alur ATP
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {viewMode === "table" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1">
            <DataTable 
              data={filteredTp.sort((a,b) => (a.urutan || 0) - (b.urutan || 0))}
              columns={tableColumns}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              searchKey="kompetensi"
            />
          </div>
        )}

        {viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTp.sort((a,b) => (a.urutan || 0) - (b.urutan || 0)).map(t => (
              <TpCard 
                key={t.tpId} 
                tp={t} 
                onEdit={handleEdit} 
                onDelete={handleDeleteRequest}
                kelasNames={getKelasNames(t.kelasTargetIds)}
              />
            ))}
            {filteredTp.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 bg-white border border-dashed rounded-lg">
                Belum ada data untuk fase ini.
              </div>
            )}
          </div>
        )}

        {viewMode === "atp" && (
          <AtpBuilder items={filteredTp} />
        )}
      </div>

      {/* Form Modal */}
      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <Dialog.Title className="text-xl font-semibold leading-none tracking-tight">
                {editingTp ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran Baru'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">
                Lengkapi form di bawah ini untuk mengelola TP.
              </Dialog.Description>
            </div>
            
            <TpForm 
              initialData={editingTp}
              availableClasses={kelas}
              maxExistingUrutan={maxExistingUrutan}
              onSubmit={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTp(undefined);
              }}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Confirm Delete */}
      <ConfirmDialog 
        isOpen={isConfirmDeleteOpen}
        title="Hapus Tujuan Pembelajaran"
        description="Apakah Anda yakin ingin menghapus TP ini? Semua data terkait (KKTP, nilai asesmen) yang berhubungan dengan TP ini mungkin akan terpengaruh atau ikut terhapus secara sistemik."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmDeleteOpen(false);
          setTpToDelete(null);
        }}
      />
    </div>
  );
}
