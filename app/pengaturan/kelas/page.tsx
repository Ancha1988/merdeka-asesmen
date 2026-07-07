"use client";

import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { Kelas } from "@/types";
import { Loader2, Plus, Users, AlertCircle } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { KelasForm } from "@/components/pengaturan/kelas/KelasForm";
import { EmptyState } from "@/components/shared/EmptyState";

export default function KelasPage() {
  const { kelas, murid, guru, tahunAjaran, updateKelas, isLoading } = useMasterData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Kelas | undefined>(undefined);

  const activeTA = tahunAjaran.find(t => t.isActive);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!activeTA) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelas / Rombel</h1>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg">Tahun Ajaran Belum Diatur</h3>
            <p className="mt-1 text-sm">Anda harus mengatur dan mengaktifkan minimal satu Tahun Ajaran di menu Pengaturan - Tahun Ajaran sebelum dapat mengelola Kelas.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = (data: Kelas) => {
    let updatedList = [...kelas];
    const index = updatedList.findIndex(item => item.kelasId === data.kelasId);
    if (index >= 0) {
      updatedList[index] = data;
    } else {
      updatedList.push(data);
    }
    updateKelas(updatedList);
    setIsFormOpen(false);
    setEditingData(undefined);
  };

  const getGuruName = (uid: string | null) => {
    if (!uid) return "-";
    const g = guru.find(g => g.uid === uid);
    return g ? g.nama : "-";
  };

  const getJumlahMurid = (kelasId: string) => {
    return murid.filter(m => m.kelasId === kelasId && m.status === 'aktif').length;
  };

  const currentTahunKelas = kelas.filter(k => k.tahunId === activeTA.tahunId);

  const columns: Column<Kelas>[] = [
    { header: "Nama Kelas", accessorKey: "namaKelas" },
    { header: "Fase", accessorKey: "fase" },
    { header: "Tingkat", accessorKey: "tingkat" },
    { 
      header: "Wali Kelas", 
      cell: (item) => getGuruName(item.waliKelasId) 
    },
    { 
      header: "Jumlah Murid", 
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{getJumlahMurid(item.kelasId)} / {item.kapasitas}</span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelas / Rombel</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola rombongan belajar untuk <strong className="text-blue-600">T.A. {activeTA.tahun}</strong></p>
        </div>
        <button 
          onClick={() => { setEditingData(undefined); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Tambah Kelas
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {currentTahunKelas.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title="Belum ada Kelas di Tahun Ajaran ini" 
            description="Mulai tambahkan kelas untuk mengelompokkan murid-murid."
            actionLabel="Tambah Kelas"
            onAction={() => { setEditingData(undefined); setIsFormOpen(true); }}
          />
        ) : (
          <DataTable 
            data={currentTahunKelas} 
            columns={columns} 
            onEdit={(item) => {
              setEditingData(item);
              setIsFormOpen(true);
            }} 
            searchKey="namaKelas"
          />
        )}
      </div>

      {isFormOpen && (
        <KelasForm 
          initialData={editingData} 
          guruData={guru}
          tahunAjaranAktif={activeTA}
          onSave={handleSave} 
          onCancel={() => { setIsFormOpen(false); setEditingData(undefined); }} 
        />
      )}
    </div>
  );
}
