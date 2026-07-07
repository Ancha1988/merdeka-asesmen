"use client";

import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { Guru } from "@/types";
import { Loader2, Plus, UserCircle } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { GuruForm } from "@/components/pengaturan/guru/GuruForm";
import { EmptyState } from "@/components/shared/EmptyState";

export default function GuruPage() {
  const { guru, kelas, updateGuru, isLoading } = useMasterData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Guru | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const handleSave = (data: Guru) => {
    let updatedList = [...guru];
    const index = updatedList.findIndex(item => item.uid === data.uid);
    if (index >= 0) {
      updatedList[index] = data;
    } else {
      updatedList.push(data);
    }
    updateGuru(updatedList);
    setIsFormOpen(false);
    setEditingData(undefined);
  };

  const renderRole = (role: string) => {
    switch (role) {
      case 'kepsek': return <span className="text-amber-700 font-medium">Kepala Sekolah</span>;
      case 'koordinator': return <span className="text-blue-700 font-medium">Koordinator</span>;
      default: return <span>Guru</span>;
    }
  };

  const columns: Column<Guru>[] = [
    { header: "Nama Lengkap", accessorKey: "nama" },
    { header: "NIP", cell: (item) => item.nip || "-" },
    { header: "Email", accessorKey: "email" },
    { 
      header: "Peran", 
      cell: (item) => renderRole(item.role)
    },
    {
      header: "Kelas Diampu",
      cell: (item) => {
        if (!item.kelasDiampu || item.kelasDiampu.length === 0) return "-";
        return item.kelasDiampu.length + " Kelas";
      }
    },
    {
      header: "Status",
      cell: (item) => item.isActive ? (
        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">AKTIF</span>
      ) : (
        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full border border-slate-200">Non-Aktif</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Guru</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data tenaga pendidik dan peran sistem.</p>
        </div>
        <button 
          onClick={() => { setEditingData(undefined); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Tambah Guru
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {guru.length === 0 ? (
          <EmptyState 
            icon={UserCircle} 
            title="Belum ada Data Guru" 
            description="Tambahkan profil guru untuk mengaitkan ke kelas dan pengisian nilai."
            actionLabel="Tambah Guru"
            onAction={() => { setEditingData(undefined); setIsFormOpen(true); }}
          />
        ) : (
          <DataTable 
            data={guru} 
            columns={columns} 
            onEdit={(item) => {
              setEditingData(item);
              setIsFormOpen(true);
            }} 
            searchKey="nama"
          />
        )}
      </div>

      {isFormOpen && (
        <GuruForm 
          initialData={editingData} 
          kelasList={kelas}
          existingGuru={guru}
          onSave={handleSave} 
          onCancel={() => { setIsFormOpen(false); setEditingData(undefined); }} 
        />
      )}
    </div>
  );
}
