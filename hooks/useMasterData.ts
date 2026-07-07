import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, loadFromLocal, saveToLocal } from '@/lib/storage';
import { Sekolah, TahunAjaran, Kelas, Murid, Guru, TujuanPembelajaran, Kktp, AsesmenFormatif, Sumatif, PengolahanNilai, Intervensi } from '@/types';

export function useMasterData() {
  const [sekolah, setSekolah] = useState<Sekolah | null>(null);
  const [tahunAjaran, setTahunAjaran] = useState<TahunAjaran[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [murid, setMurid] = useState<Murid[]>([]);
  const [guru, setGuru] = useState<Guru[]>([]);
  const [tp, setTp] = useState<TujuanPembelajaran[]>([]);
  const [kktp, setKktp] = useState<Kktp[]>([]);
  const [formatif, setFormatif] = useState<AsesmenFormatif[]>([]);
  const [sumatif, setSumatif] = useState<Sumatif[]>([]);
  const [pengolahanNilai, setPengolahanNilai] = useState<PengolahanNilai[]>([]);
  const [intervensi, setIntervensi] = useState<Intervensi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(() => {
    setSekolah(loadFromLocal<Sekolah>(STORAGE_KEYS.SEKOLAH));
    setTahunAjaran(loadFromLocal<TahunAjaran[]>(STORAGE_KEYS.TAHUN_AJARAN) || []);
    setKelas(loadFromLocal<Kelas[]>(STORAGE_KEYS.KELAS) || []);
    setMurid(loadFromLocal<Murid[]>(STORAGE_KEYS.MURID) || []);
    setGuru(loadFromLocal<Guru[]>(STORAGE_KEYS.GURU) || []);
    setTp(loadFromLocal<TujuanPembelajaran[]>(STORAGE_KEYS.TP) || []);
    setKktp(loadFromLocal<Kktp[]>(STORAGE_KEYS.KKTP) || []);
    setFormatif(loadFromLocal<AsesmenFormatif[]>(STORAGE_KEYS.FORMATIF) || []);
    setSumatif(loadFromLocal<Sumatif[]>(STORAGE_KEYS.SUMATIF) || []);
    setPengolahanNilai(loadFromLocal<PengolahanNilai[]>(STORAGE_KEYS.PENGOLAHAN_NILAI) || []);
    setIntervensi(loadFromLocal<Intervensi[]>(STORAGE_KEYS.INTERVENSI) || []);
    setIsLoading(false);
  }, []);
  useEffect(() => {
    // Adding setTimeout to ensure setState is async and avoids cascading renders error.
    const timer = setTimeout(() => {
      refreshData();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshData]);

  const updateSekolah = (data: Sekolah) => {
    saveToLocal(STORAGE_KEYS.SEKOLAH, data);
    setSekolah(data);
  };

  const updateTahunAjaran = (list: TahunAjaran[]) => {
    saveToLocal(STORAGE_KEYS.TAHUN_AJARAN, list);
    setTahunAjaran(list);
  };

  const updateKelas = (list: Kelas[]) => {
    saveToLocal(STORAGE_KEYS.KELAS, list);
    setKelas(list);
  };

  const updateMurid = (list: Murid[]) => {
    saveToLocal(STORAGE_KEYS.MURID, list);
    setMurid(list);
  };

  const updateGuru = (list: Guru[]) => {
    saveToLocal(STORAGE_KEYS.GURU, list);
    setGuru(list);
  };

  const updateTp = (list: TujuanPembelajaran[]) => {
    saveToLocal(STORAGE_KEYS.TP, list);
    setTp(list);
  };

  const updateKktp = (list: Kktp[]) => {
    saveToLocal(STORAGE_KEYS.KKTP, list);
    setKktp(list);
  };

  const updateFormatif = (list: AsesmenFormatif[]) => {
    saveToLocal(STORAGE_KEYS.FORMATIF, list);
    setFormatif(list);
  };

  const updateSumatif = (list: Sumatif[]) => {
    saveToLocal(STORAGE_KEYS.SUMATIF, list);
    setSumatif(list);
  };

  const updatePengolahanNilai = (list: PengolahanNilai[]) => {
    saveToLocal(STORAGE_KEYS.PENGOLAHAN_NILAI, list);
    setPengolahanNilai(list);
  };

  const updateIntervensi = (list: Intervensi[]) => {
    saveToLocal(STORAGE_KEYS.INTERVENSI, list);
    setIntervensi(list);
  };

  return {
    sekolah, updateSekolah,
    tahunAjaran, updateTahunAjaran,
    kelas, updateKelas,
    murid, updateMurid,
    guru, updateGuru,
    tp, updateTp,
    kktp, updateKktp,
    formatif, updateFormatif,
    sumatif, updateSumatif,
    pengolahanNilai, updatePengolahanNilai,
    intervensi, updateIntervensi,
    isLoading,
    refreshData
  };
}
