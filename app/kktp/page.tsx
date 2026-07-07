"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMasterData } from "@/hooks/useMasterData";
import { KktpForm } from "@/components/kktp/KktpForm";
import { KktpTable } from "@/components/kktp/KktpTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import * as Dialog from "@radix-ui/react-dialog";
import { Kktp, TujuanPembelajaran } from "@/types";

export default function KktpPage() {
  const { tp, kktp, updateKktp } = useMasterData();
  const [selectedTpId, setSelectedTpId] = useState<string>("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKktp, setEditingKktp] = useState<Kktp | undefined>();
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [kktpToDelete, setKktpToDelete] = useState<Kktp | null>(null);

  const selectedTp = tp.find((t) => t.tpId === selectedTpId);
  const kktpListForTp = kktp.filter((k) => k.tpId === selectedTpId);

  const totalBobotExist = kktpListForTp.reduce((acc, curr) => acc + curr.bobot, 0);

  const handleSave = (data: Omit<Kktp, "kktpId" | "createdAt">) => {
    const newGlobalKktp = [...kktp];
    
    if (editingKktp) {
      const index = newGlobalKktp.findIndex((k) => k.kktpId === editingKktp.kktpId);
      if (index !== -1) {
        newGlobalKktp[index] = {
          ...editingKktp,
          ...data,
        };
      }
      ToastNotifier.success("KKTP berhasil diperbarui.");
    } else {
      newGlobalKktp.push({
        ...data,
        kktpId: `kktp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      ToastNotifier.success("KKTP berhasil ditambahkan.");
    }
    
    updateKktp(newGlobalKktp);
    setIsFormOpen(false);
    setEditingKktp(undefined);
  };

  const handleEdit = (item: Kktp) => {
    setEditingKktp(item);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (item: Kktp) => {
    setKktpToDelete(item);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (kktpToDelete) {
      const newGlobalKktp = kktp.filter((k) => k.kktpId !== kktpToDelete.kktpId);
      updateKktp(newGlobalKktp);
      ToastNotifier.success("KKTP berhasil dihapus.");
    }
    setIsConfirmDeleteOpen(false);
    setKktpToDelete(null);
  };

  const openNewForm = () => {
    if (!selectedTpId) {
      ToastNotifier.error("Pilih Tujuan Pembelajaran (TP) terlebih dahulu.");
      return;
    }
    if (totalBobotExist >= 100) {
      ToastNotifier.warning("Total bobot untuk TP ini sudah 100%. Anda tidak dapat menambahkan KKTP baru.");
      return;
    }
    setEditingKktp(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kriteria Ketercapaian (KKTP)</h1>
          <p className="text-slate-500">Kelola standar penilaian (KKTP) untuk setiap Tujuan Pembelajaran</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Tujuan Pembelajaran (TP)</label>
        <select 
          value={selectedTpId}
          onChange={(e) => setSelectedTpId(e.target.value)}
          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih Tujuan Pembelajaran --</option>
          {tp.sort((a,b) => (a.urutan || 0) - (b.urutan || 0)).map((t) => (
            <option key={t.tpId} value={t.tpId}>
              {t.fase} - {t.urutan}. {t.kompetensi.substring(0, 80)}{t.kompetensi.length > 80 ? '...' : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedTpId && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-semibold text-slate-800">Daftar KKTP</h2>
            <button
              onClick={openNewForm}
              disabled={totalBobotExist >= 100}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Tambah KKTP
            </button>
          </div>

          <div className="flex gap-4 mb-2 text-sm">
            <div className={`px-3 py-1.5 rounded-md font-medium ${totalBobotExist === 100 ? 'bg-green-100 text-green-800' : totalBobotExist > 100 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
              Total Bobot: {totalBobotExist}%
            </div>
          </div>

          <KktpTable 
            data={kktpListForTp}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        </div>
      )}

      {/* Form Modal */}
      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <Dialog.Title className="text-xl font-semibold leading-none tracking-tight">
                {editingKktp ? 'Edit KKTP' : 'Tambah KKTP Baru'}
              </Dialog.Title>
              {editingKktp && (
                 <div className="bg-amber-50 text-amber-800 px-3 py-2 rounded-md text-sm mt-2 border border-amber-200">
                   <strong>Perhatian:</strong> Perubahan pada KKTP ini mungkin akan mempengaruhi penilaian yang sudah ada.
                 </div>
              )}
            </div>
            
            {selectedTp && (
              <KktpForm 
                initialData={editingKktp}
                selectedTp={selectedTp}
                currentTotalBobot={editingKktp ? totalBobotExist - editingKktp.bobot : totalBobotExist}
                onSubmit={handleSave}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingKktp(undefined);
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Confirm Delete */}
      <ConfirmDialog 
        isOpen={isConfirmDeleteOpen}
        title="Hapus KKTP"
        description="Apakah Anda yakin ingin menghapus KKTP ini? Jika KKTP ini sudah digunakan dalam penilaian Sumatif, data penilaian mungkin akan ikut terhapus atau tidak valid."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmDeleteOpen(false);
          setKktpToDelete(null);
        }}
      />
    </div>
  );
}
