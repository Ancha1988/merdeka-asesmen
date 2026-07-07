import { useState, useEffect, useCallback } from 'react';
import { loadFromLocal, saveToLocal } from '@/lib/storage';
import { PresensiHarian } from '@/types/presensi';

const STORAGE_KEY = 'merdeka_presensi';

export function usePresensi() {
  const [presensiData, setPresensiData] = useState<PresensiHarian[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(() => {
    setPresensiData(loadFromLocal<PresensiHarian[]>(STORAGE_KEY) || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshData();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshData]);

  const savePresensi = (newRecord: PresensiHarian) => {
    setPresensiData(prev => {
      // replace if exists
      const existingIdx = prev.findIndex(p => p.tahunId === newRecord.tahunId && p.kelasId === newRecord.kelasId && p.tanggal === newRecord.tanggal);
      let updated: PresensiHarian[];
      if (existingIdx !== -1) {
        updated = [...prev];
        updated[existingIdx] = newRecord;
      } else {
        updated = [...prev, newRecord];
      }
      saveToLocal(STORAGE_KEY, updated);
      return updated;
    });
  };

  return { presensiData, savePresensi, refreshData, isLoading };
}
