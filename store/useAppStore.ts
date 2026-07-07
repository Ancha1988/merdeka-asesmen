import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, TahunAjaran, Kelas, Murid } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tahunAjaranAktif: null,
      kelasAktif: null,
      muridAktif: null,
      setTahunAjaranAktif: (t: TahunAjaran | null) => set({ tahunAjaranAktif: t }),
      setKelasAktif: (k: Kelas | null) => set({ kelasAktif: k }),
      setMuridAktif: (m: Murid | null) => set({ muridAktif: m }),
    }),
    {
      name: STORAGE_KEYS.APP_STATE,
    }
  )
);
