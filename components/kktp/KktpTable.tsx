"use client";

import { Kktp } from "@/types";
import { DataTable } from "@/components/shared/DataTable";

interface KktpTableProps {
  data: Kktp[];
  onEdit: (item: Kktp) => void;
  onDelete: (item: Kktp) => void;
}

export function KktpTable({ data, onEdit, onDelete }: KktpTableProps) {
  const getJenisLabel = (jenis: string) => {
    switch (jenis) {
      case "deskripsi": return "Deskripsi / Ceklis";
      case "rubrik": return "Rubrik Deskriptif";
      case "interval": return "Interval Nilai";
      case "persentase": return "Persentase";
      default: return jenis;
    }
  };

  const columns = [
    {
      header: "Nama KKTP",
      accessorKey: "nama" as keyof Kktp,
      cell: (item: Kktp) => (
        <div>
          <div className="font-semibold text-slate-800">{item.nama}</div>
          {item.deskripsi && (
            <div className="text-xs text-slate-500 mt-1 line-clamp-1" title={item.deskripsi}>
              {item.deskripsi}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Jenis",
      accessorKey: "jenis" as keyof Kktp,
      cell: (item: Kktp) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {getJenisLabel(item.jenis)}
        </span>
      )
    },
    {
      header: "Bobot",
      accessorKey: "bobot" as keyof Kktp,
      cell: (item: Kktp) => (
        <span className="font-medium text-slate-700">{item.bobot}%</span>
      )
    },
    {
      header: "Parameter",
      accessorKey: "indikator" as keyof Kktp,
      cell: (item: Kktp) => {
        if (item.jenis === "deskripsi") return `${item.indikator?.length || 0} Indikator`;
        if (item.jenis === "rubrik") return `${item.rubrik?.length || 0} Tingkatan`;
        if (item.jenis === "interval") return `${item.interval?.length || 0} Interval`;
        if (item.jenis === "persentase") return `Target: ${item.persentase?.thresholdMelebihi || 0}%`;
        return "-";
      }
    }
  ];

  return (
    <DataTable 
      data={data}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      searchKey="nama"
    />
  );
}
