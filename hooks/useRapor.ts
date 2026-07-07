import { useState, useEffect, useCallback } from 'react';
import { loadFromLocal, saveToLocal } from '@/lib/storage';
import { Rapor, RaporDeskripsiMapel, RaporProfilDimensi } from '@/types';

const STORAGE_KEY = 'merdeka_rapor';

export function useRapor() {
  const [raporList, setRaporList] = useState<Rapor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(() => {
    setRaporList(loadFromLocal<Rapor[]>(STORAGE_KEY) || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshData();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshData]);

  const updateRapor = (newRecord: Rapor) => {
    setRaporList(prev => {
      const existingIdx = prev.findIndex(r => r.raporId === newRecord.raporId);
      let updated: Rapor[];
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

  return { raporList, updateRapor, refreshData, isLoading };
}
