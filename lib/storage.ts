export const STORAGE_KEYS = {
  SEKOLAH: "merdeka_sekolah",
  TAHUN_AJARAN: "merdeka_tahun_ajaran",
  KELAS: "merdeka_kelas",
  MURID: "merdeka_murid",
  GURU: "merdeka_guru",
  TP: "merdeka_tp",
  KKTP: "merdeka_kktp",
  FORMATIF: "merdeka_formatif",
  SUMATIF: "merdeka_sumatif",
  PENGOLAHAN_NILAI: "merdeka_pengolahan_nilai",
  INTERVENSI: "merdeka_intervensi",
  RAPOR: "merdeka_rapor",
  APP_STATE: "merdeka_app_state",
} as const;

export function saveToLocal<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error(`Error saving to localStorage for key: ${key}`, error);
  }
}

export function loadFromLocal<T>(key: string): T | null {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch (error) {
    console.error(`Error loading from localStorage for key: ${key}`, error);
    return null;
  }
}

export function removeFromLocal(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing from localStorage for key: ${key}`, error);
  }
}

export function exportAllData(): string {
  if (typeof window === 'undefined') return "";
  const data: Record<string, any> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        data[key] = JSON.parse(item);
      } catch (e) {
        console.error(`Error parsing data for export from key ${key}`, e);
      }
    }
  }
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') return false;
    
    for (const key of Object.values(STORAGE_KEYS)) {
      if (data[key] !== undefined) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    }
    return true;
  } catch (error) {
    console.error("Error importing data", error);
    return false;
  }
}
