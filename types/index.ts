export interface Sekolah {
  sekolahId: string;
  nama: string;
  jenjang: "PAUD" | "SD" | "SMP" | "SMA" | "SMK" | "PK";
  npsn: string;
  alamat: string;
  kepsek: string;
  nipKepsek: string;
  telepon: string;
  email: string;
  logoUrl: string | null;
  isActive: boolean;
}

export interface TahunAjaran {
  tahunId: string;
  tahun: string; // "2025/2026"
  semester: 1 | 2;
  isActive: boolean;
  tanggalMulai: string; // ISO date
  tanggalSelesai: string;
}

export interface Kelas {
  kelasId: string;
  namaKelas: string; // "7A", "X-TKJ-1"
  fase: "A" | "B" | "C" | "D" | "E";
  tingkat: number; // 1-12
  waliKelasId: string | null;
  tahunId: string;
  muridIds: string[];
  kapasitas: number;
  isActive: boolean;
}

export interface Murid {
  muridId: string;
  nisn: string; // wajib, unique
  nama: string;
  jenisKelamin: "L" | "P";
  kelasId: string | null;
  noHpOrtu: string | null;
  tahunMasuk: string;
  status: "aktif" | "naik_kelas" | "mutasi" | "lulus";
  riwayatKelas: RiwayatKelasItem[];
}

export interface RiwayatKelasItem {
  kelasId: string;
  tahunId: string;
  tanggalMasuk: string;
  tanggalKeluar: string | null;
  alasan: string;
}

export interface Guru {
  uid: string;
  email: string;
  nama: string;
  role: "guru" | "koordinator" | "kepsek";
  nip: string | null;
  kelasDiampu: string[]; // array kelasId
  isActive: boolean;
}

export interface TujuanPembelajaran {
  tpId: string;
  fase: "A" | "B" | "C" | "D" | "E";
  kelasTargetIds: string[]; // ref ke kelas
  kompetensi: string;
  lingkupMateri: string;
  indikator: string[]; // array dinamis, minimal 1
  dimensiIds: string[]; // ref ke 8 dimensi profil
  urutan: number; // urutan ATP
  alokasiWaktu: number; // JP (Jam Pelajaran)
  createdAt: string;
  updatedAt: string;
}

export interface DimensiProfil {
  dimensiId: string;
  nama: string;
  deskripsi: string;
  kode: string; // "D1", "D2", dst
  icon: string; // nama lucide icon
}

export interface Kktp {
  kktpId: string;
  tpId: string;
  jenis: "deskripsi" | "rubrik" | "interval" | "persentase";
  nama: string;
  deskripsi: string;
  bobot: number; // 0-100
  indikator: KktpIndikator[];
  rubrik?: RubrikItem[]; // jika jenis = rubrik
  interval?: IntervalItem[]; // jika jenis = interval
  persentase?: PersentaseConfig; // jika jenis = persentase
  minKriteriaTuntas?: number; // jika jenis = deskripsi
  createdAt: string;
}

export interface KktpIndikator {
  indikatorId: string;
  deskripsi: string;
  thresholdLulus: boolean; // untuk ceklis
}

export interface RubrikItem {
  indikator?: string;
  tingkatan: "BB" | "L" | "C" | "M";
  label: string;
  deskripsi: string;
  nilaiMin: number;
  nilaiMax: number;
}

export interface IntervalItem {
  label: string;
  nilaiMin: number;
  nilaiMax: number;
  rekomendasi: string; // "remedial_total", "remedial_parsial", "pengayaan"
}

export interface PersentaseConfig {
  totalIndikator: number;
  thresholdMelebihi: number; // % untuk status "cakap"
}

export interface AsesmenFormatif {
  asesmenId: string;
  muridId: string;
  kelasId: string;
  tpId: string;
  jenis: "observasi" | "anekdot" | "cats" | "refleksi";
  tanggal: string;
  data: AsesmenFormatifData;
  catatan: string;
  createdBy: string;
}

export type AsesmenFormatifData =
  | { frekuensi: number; aspek: string } // observasi
  | { peristiwa: string; konteks: string } // anekdot
  | { strategi: string; hasil: string } // cats
  | { penilaianDiri: number; penilaianTeman?: number }; // refleksi

export interface Sumatif {
  sumatifId: string;
  muridId: string;
  kelasId: string;
  tpId: string;
  kktpId: string;
  nilaiAngka: number | null; // 0-100, null jika mode deskripsi
  nilaiDeskripsi: string | null; // null jika mode angka
  formatInput: "angka" | "deskripsi";
  tanggal: string;
  pengujiId: string;
}

export interface PengolahanNilai {
  pengolahanId: string;
  muridId: string;
  tpId: string;
  metode: "rata_rata" | "pembobotan";
  nilaiAkhir: number;
  nilaiAsli?: number | null; // Nilai asli sebelum remedial
  isTuntas?: boolean; // Evaluated tuntas status
  detail: { kktpId: string; bobot: number; nilai: number; kontribusi: number }[];
}

export interface Intervensi {
  intervensiId: string;
  muridId: string;
  tpId: string;
  jenis: "remedial" | "pengayaan";
  status: "direncanakan" | "berjalan" | "selesai";
  rencana: string;
  tanggalMulai: string;
  tanggalSelesai: string | null;
  nilaiAsli?: number | null; // Nilai asli sebelum remedial
  nilaiRemedial?: number | null; // Hasil nilai remedial
}

export interface Rapor {
  raporId: string;
  muridId: string;
  kelasId: string;
  tahunId: string;
  semester: 1 | 2;
  tanggalCetak: string;
  status: "draft" | "valid" | "dicetak";
  deskripsiMapel: RaporDeskripsiMapel[];
  profilDimensi: RaporProfilDimensi[];
}

export interface RaporDeskripsiMapel {
  mapelId: string;
  kompetensiTertinggi: string;
  kompetensiMeningkat: string;
  deskripsiNlg: string;
  saranOrtu: string;
  nilaiAkhir: number;
}

export interface RaporProfilDimensi {
  dimensiId: string;
  nilaiFormatif: number;
  nilaiSumatif: number;
  tingkat: "BB" | "L" | "C" | "M";
}

export interface AppState {
  tahunAjaranAktif: TahunAjaran | null;
  kelasAktif: Kelas | null;
  muridAktif: Murid | null;
  setTahunAjaranAktif: (t: TahunAjaran | null) => void;
  setKelasAktif: (k: Kelas | null) => void;
  setMuridAktif: (m: Murid | null) => void;
}
