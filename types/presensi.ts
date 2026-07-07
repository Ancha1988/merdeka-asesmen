// Separate interfaces so we don't break types/index.ts

export type StatusKehadiran = "HADIR" | "SAKIT" | "IZIN" | "ALPA" | "BOLOS";

export interface PresensiMurid {
  muridId: string;
  status: StatusKehadiran;
  catatanKehadiran?: string;
  catatanSikap?: string;
  catatanAkademik?: string;
}

export interface PresensiHarian {
  id: string; // format e.g., prs-[tahunId]-[kelasId]-[tanggal]
  tahunId: string;
  kelasId: string;
  tanggal: string; // format: YYYY-MM-DD
  muridPresensi: PresensiMurid[];
}
