import { DimensiProfil } from "@/types";

export const JENJANG_SEKOLAH = ["PAUD", "SD", "SMP", "SMA", "SMK", "PK"] as const;

export const FASE_SEKOLAH = ["A", "B", "C", "D", "E"] as const;

export const STATUS_MURID = ["aktif", "naik_kelas", "mutasi", "lulus"] as const;

export const DIMENSI_PROFIL: DimensiProfil[] = [
  {
    dimensiId: "D1",
    kode: "D1",
    nama: "Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia",
    deskripsi:
      "Pelajar Indonesia yang beriman, bertakwa kepada Tuhan YME, dan berakhlak mulia adalah pelajar yang berakhlak dalam hubungannya dengan Tuhan Yang Maha Esa.",
    icon: "Heart",
  },
  {
    dimensiId: "D2",
    kode: "D2",
    nama: "Berkebinekaan Global",
    deskripsi:
      "Pelajar Indonesia mempertahankan kebudayaan luhur, lokalitas, dan identitasnya, dan tetap berpikiran terbuka dalam berinteraksi dengan budaya lain.",
    icon: "Globe",
  },
  {
    dimensiId: "D3",
    kode: "D3",
    nama: "Bergotong Royong",
    deskripsi:
      "Pelajar Indonesia memiliki kemampuan bergotong-royong, yaitu kemampuan untuk melakukan kegiatan secara bersama-sama dengan suka rela.",
    icon: "Users",
  },
  {
    dimensiId: "D4",
    kode: "D4",
    nama: "Mandiri",
    deskripsi:
      "Pelajar Indonesia merupakan pelajar mandiri, yaitu pelajar yang bertanggung jawab atas proses dan hasil belajarnya.",
    icon: "User",
  },
  {
    dimensiId: "D5",
    kode: "D5",
    nama: "Bernalar Kritis",
    deskripsi:
      "Pelajar yang bernalar kritis mampu secara objektif memproses informasi baik kualitatif maupun kuantitatif, membangun keterkaitan antara berbagai informasi.",
    icon: "Brain",
  },
  {
    dimensiId: "D6",
    kode: "D6",
    nama: "Kreatif",
    deskripsi:
      "Pelajar yang kreatif mampu memodifikasi dan menghasilkan sesuatu yang orisinal, bermakna, bermanfaat, dan berdampak.",
    icon: "Lightbulb",
  },
  {
    dimensiId: "D7",
    kode: "D7",
    nama: "Komunikatif",
    deskripsi:
      "Mampu berkomunikasi dengan baik dan efektif dalam menyampaikan gagasan dan pikiran.",
    icon: "MessageCircle",
  },
  {
    dimensiId: "D8",
    kode: "D8",
    nama: "Entrepreneurial",
    deskripsi:
      "Memiliki jiwa kewirausahaan, proaktif, dan mampu melihat peluang untuk menciptakan nilai tambah.",
    icon: "Briefcase",
  },
];
