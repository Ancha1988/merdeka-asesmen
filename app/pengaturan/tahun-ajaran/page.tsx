"use client";

import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { TahunAjaran } from "@/types";
import { Loader2, Plus, Calendar } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { TahunAjaranForm } from "@/components/pengaturan/tahun-ajaran/TahunAjaranForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";

export default function TahunAjaranPage() {
  const { tahunAjaran, updateTahunAjaran, isLoading } = useMasterData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<TahunAjaran | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const handleSave = (data: TahunAjaran) => {
    let updatedList = [...tahunAjaran];
    
    // Auto sync logic: Only 1 active
    if (data.isActive) {
      updatedList = updatedList.map(item => ({ ...item, isActive: false }));
    }

    const index = updatedList.findIndex(item => item.tahunId === data.tahunId);
    if (index >= 0) {
      updatedList[index] = data;
    } else {
      updatedList.push(data);
    }

    // Ensure at least one is active if list exists and none is active
    if (updatedList.length > 0 && !updatedList.some(item => item.isActive)) {
      updatedList[0].isActive = true;
    }

    updateTahunAjaran(updatedList);
    setIsFormOpen(false);
    setEditingData(undefined);
  };

  const setAktif = (itemToActivate: TahunAjaran) => {
    const updatedList = tahunAjaran.map(item => ({
      ...item,
      isActive: item.tahunId === itemToActivate.tahunId
    }));
    updateTahunAjaran(updatedList);
  };

  const columns: Column<TahunAjaran>[] = [
    { header: "Tahun Ajaran", accessorKey: "tahun" },
    { 
      header: "Semester", 
      cell: (item) => item.semester === 1 ? "1 (Ganjil)" : "2 (Genap)" 
    },
    {
      header: "Periode",
      cell: (item) => <span className="text-sm text-slate-500">{formatDate(item.tanggalMulai)} - {formatDate(item.tanggalSelesai)}</span>
    },
    {
      header: "Status",
      cell: (item) => item.isActive ? (
        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">AKTIF</span>
      ) : (
        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full border border-slate-200">Non-Aktif</span>
      )
    },
    {
      header: "Set Aktif",
      cell: (item) => !item.isActive && (
        <button 
          onClick={() => setAktif(item)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          Jadikan Aktif
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tahun Ajaran</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola periode akademik dan atur periode yang sedang berjalan.</p>
        </div>
        <button 
          onClick={() => { setEditingData(undefined); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {tahunAjaran.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            title="Belum ada Tahun Ajaran" 
            description="Tambahkan tahun ajaran baru untuk mulai menggunakan sistem."
            actionLabel="Tambah Sekarang"
            onAction={() => { setEditingData(undefined); setIsFormOpen(true); }}
          />
        ) : (
          <DataTable 
            data={tahunAjaran} 
            columns={columns} 
            onEdit={(item) => {
              setEditingData(item);
              setIsFormOpen(true);
            }} 
            searchKey="tahun"
          />
        )}
      </div>

      {isFormOpen && (
        <TahunAjaranForm 
          initialData={editingData} 
          onSave={handleSave} 
          onCancel={() => { setIsFormOpen(false); setEditingData(undefined); }} 
        />
      )}
    </div>
  );
}
