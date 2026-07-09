import { useState, useEffect } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Sumatif, Kktp } from "@/types";

interface InputNilaiTabProps {
  kelasId: string;
  tpId: string;
}

export function InputNilaiTab({ kelasId, tpId }: InputNilaiTabProps) {
  const { kelas, murid, tp, kktp, sumatif, updateSumatif } = useMasterData();
  
  const [localData, setLocalData] = useState<Record<string, Record<string, any>>>({}); // muridId -> { kktpId -> value }
  const [confirmOpen, setConfirmOpen] = useState(false);

  const activeKelas = kelas.find(k => k.kelasId === kelasId);
  const activeTp = tp.find(t => t.tpId === tpId);
  
  const availableMurid = murid.filter(m => m.kelasId === kelasId && m.status === 'aktif');
  const availableKktp = kktp.filter(k => k.tpId === tpId).sort((a,b) => a.nama.localeCompare(b.nama));

  // Load existing data to local state
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (!kelasId || !tpId) {
        if (active) setLocalData({});
        return;
      }
      
      const existing = sumatif.filter(s => s.kelasId === kelasId && s.tpId === tpId);
      const newLocalState: Record<string, Record<string, any>> = {};
      
      existing.forEach(s => {
        if (!newLocalState[s.muridId]) newLocalState[s.muridId] = {};
        const kktpObj = availableKktp.find(k => k.kktpId === s.kktpId);
        if (kktpObj?.jenis === "deskripsi") {
          newLocalState[s.muridId][s.kktpId] = s.nilaiDeskripsi;
        } else {
          newLocalState[s.muridId][s.kktpId] = s.formatInput === "angka" ? s.nilaiAngka : s.nilaiDeskripsi;
        }
      });
      
      if (active) setLocalData(newLocalState);
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [kelasId, tpId, sumatif]);

  const handleCellChange = (muridId: string, kktpId: string, value: any) => {
    setLocalData(prev => ({
      ...prev,
      [muridId]: {
        ...(prev[muridId] || {}),
        [kktpId]: value
      }
    }));
  };

  const handleSaveAll = () => {
    if (!kelasId || !tpId) return;
    setConfirmOpen(true);
  };

  const confirmSave = () => {
    // We update the global `sumatif` state
    // Remove old for this Kelas & TP, add new
    const filteredSumatif = sumatif.filter(s => !(s.kelasId === kelasId && s.tpId === tpId));
    
    const newSumatifItems: Sumatif[] = [];
    
    Object.keys(localData).forEach(mId => {
      Object.keys(localData[mId]).forEach(kId => {
        const val = localData[mId][kId];
        if (val !== undefined && val !== null && val !== "") {
          const kktpObj = availableKktp.find(k => k.kktpId === kId);
          if (kktpObj) {
            let isAngka = kktpObj.jenis === "interval" || kktpObj.jenis === "persentase";
            let formatInput: "angka" | "deskripsi" = isAngka ? "angka" : "deskripsi";
            let nilaiAngka: number | null = isAngka ? Number(val) : null;
            let nilaiDeskripsi: string | null = !isAngka ? String(val) : null;

            if (kktpObj.jenis === "deskripsi") {
               try {
                 const checks = JSON.parse(String(val));
                 if (typeof checks === "object") {
                   const totalChecks = Object.values(checks).filter(Boolean).length;
                   const minKriteria = kktpObj.minKriteriaTuntas || 1;
                   const totalInd = kktpObj.indikator?.length || 1;
                   
                   const tuntas = totalChecks >= minKriteria;
                   
                   if (tuntas) {
                     if (totalInd <= minKriteria) {
                       nilaiAngka = 100;
                     } else {
                       nilaiAngka = Math.round(70 + ((totalChecks - minKriteria) / (totalInd - minKriteria)) * 30);
                     }
                   } else {
                     nilaiAngka = Math.round((totalChecks / minKriteria) * 69);
                   }
                   
                   formatInput = "angka"; // Store as numerical so pengolahan works
                 }
               } catch (e) {
                 // Ignore parsing errors, potentially legacy text
                 nilaiAngka = Number(val) || 0;
                 formatInput = "angka";
               }
            } else if (kktpObj.jenis === "rubrik") {
               try {
                 const selectedLevels = JSON.parse(String(val));
                 if (typeof selectedLevels === "object" && kktpObj.rubrik) {
                   const indicators = Array.from(new Set(kktpObj.rubrik.map(r => r.indikatorId).filter(Boolean))) as string[];
                   let totalScore = 0;
                   let count = 0;
                   
                   for (const ind of indicators) {
                     const level = selectedLevels[ind];
                     if (level) {
                       // find the average of nilaiMin and nilaiMax for this level
                       const rubrikItem = kktpObj.rubrik.find(r => r.indikatorId === ind && r.tingkatan === level);
                       if (rubrikItem) {
                         totalScore += (rubrikItem.nilaiMin + rubrikItem.nilaiMax) / 2;
                         count++;
                       }
                     }
                   }
                   
                   if (count > 0) {
                     nilaiAngka = Math.round(totalScore / count);
                     formatInput = "angka";
                   }
                 }
               } catch (e) {
                 // ignore
               }
            }

            newSumatifItems.push({
              sumatifId: `sum-${Date.now()}-${mId}-${kId}`,
              muridId: mId,
              kelasId,
              tpId,
              kktpId: kId,
              formatInput,
              nilaiAngka,
              nilaiDeskripsi,
              tanggal: new Date().toISOString().split('T')[0],
              pengujiId: "current-user"
            });
          }
        }
      });
    });

    updateSumatif([...filteredSumatif, ...newSumatifItems]);
    ToastNotifier.success("Nilai sumatif berhasil disimpan.");
    setConfirmOpen(false);
  };

  if (!kelasId || !tpId) {
    return (
      <div className="p-10 text-center text-slate-500">
        Silakan pilih Kelas dan TP terlebih dahulu untuk menginput nilai.
      </div>
    );
  }

  if (availableKktp.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500">
        <p className="mb-2">Tujuan Pembelajaran ini belum memiliki Kriteria Ketercapaian (KKTP).</p>
        <p className="text-sm">Silakan buat KKTP di menu Master Data &gt; KKTP terlebih dahulu.</p>
      </div>
    );
  }

  const renderIndicatorInput = (mId: string, k: Kktp, ind: any) => {
    const defaultVal = localData[mId]?.[k.kktpId] ?? "";
    let checks: Record<string, boolean> = {};
    try {
      checks = (defaultVal && typeof defaultVal === "string" && defaultVal.startsWith("{")) ? JSON.parse(defaultVal) : {};
    } catch(e) {}
    
    const isChecked = !!checks[ind.indikatorId];

    return (
      <div className="flex justify-center items-center h-full pt-1">
        <input 
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            const newChecks = { ...checks, [ind.indikatorId]: e.target.checked };
            handleCellChange(mId, k.kktpId, JSON.stringify(newChecks));
          }}
          className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
        />
      </div>
    );
  };

  const renderRubrikIndicatorInput = (mId: string, k: Kktp, indId: string) => {
    const defaultVal = localData[mId]?.[k.kktpId] ?? "";
    let selectedLevels: Record<string, string> = {};
    try {
      selectedLevels = (defaultVal && typeof defaultVal === "string" && defaultVal.startsWith("{")) ? JSON.parse(defaultVal) : {};
    } catch(e) {}
    
    const selectedLevel = selectedLevels[indId] || "";
    
    // Get unique rubrik options for this indicator
    const options = k.rubrik?.filter(r => r.indikatorId === indId) || [];

    return (
      <select
        value={selectedLevel}
        onChange={(e) => {
          const newLevels = { ...selectedLevels, [indId]: e.target.value };
          handleCellChange(mId, k.kktpId, JSON.stringify(newLevels));
        }}
        className={`w-full px-2 py-2 border rounded focus:outline-none text-sm ${
          selectedLevel !== "" ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'border-slate-200'
        }`}
      >
        <option value="">-</option>
        {options.map(r => (
          <option key={r.tingkatan} value={r.tingkatan}>{r.tingkatan} ({r.label})</option>
        ))}
      </select>
    );
  };

  const renderInput = (mId: string, k: Kktp) => {
    const defaultVal = localData[mId]?.[k.kktpId] ?? "";
    
    if (k.jenis === "interval" || k.jenis === "persentase") {
      return (
        <input 
          type="number"
          min="0" max="100"
          value={defaultVal}
          onChange={(e) => {
            let val = Number(e.target.value);
            if (val > 100) val = 100;
            if (val < 0) val = 0;
            handleCellChange(mId, k.kktpId, val);
          }}
          className={`w-full px-2 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center ${
            defaultVal !== "" ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'border-slate-200'
          }`}
          placeholder="0-100"
        />
      );
    }

    if (k.jenis === "rubrik") {
      return (
        <select
          value={defaultVal}
          onChange={(e) => handleCellChange(mId, k.kktpId, e.target.value)}
          className={`w-full px-2 py-2 border rounded focus:outline-none text-sm ${
            defaultVal !== "" ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'border-slate-200'
          }`}
        >
          <option value="">-</option>
          {k.rubrik?.map(r => (
            <option key={r.tingkatan} value={r.tingkatan}>{r.tingkatan} ({r.label})</option>
          ))}
        </select>
      );
    }

    if (k.jenis === "deskripsi") {
      return (
        <input 
          type="number"
          min="0" max="100"
          value={defaultVal}
          onChange={(e) => {
            let val = Number(e.target.value);
            if (val > 100) val = 100;
            if (val < 0) val = 0;
            handleCellChange(mId, k.kktpId, val);
          }}
          className={`w-full px-2 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center ${
            defaultVal !== "" ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'border-slate-200'
          }`}
          placeholder="0-100"
        />
      );
    }

    return null;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Tabel Input Nilai Sumatif</h2>
          <p className="text-sm text-slate-500">
            Kelas: {activeKelas?.namaKelas} | TP {activeTp?.urutan} | Jumlah Murid: {availableMurid.length}
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Simpan Semua Nilai
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold border-r border-slate-200 sticky left-0 bg-slate-50 z-10 min-w-[200px]">Nama Murid</th>
              {availableKktp.map(k => {
                if (k.jenis === "deskripsi" && k.indikator && k.indikator.length > 0) {
                  return k.indikator.map((ind, i) => (
                    <th key={`${k.kktpId}-${ind.indikatorId}`} className="px-4 py-3 font-semibold border-r border-slate-200 min-w-[150px] max-w-[250px]">
                      <div className="truncate text-[11px] text-slate-500 mb-1" title={k.nama}>{k.nama}</div>
                      <div className="line-clamp-2 text-sm text-blue-700 leading-tight" title={ind.deskripsi}>{i+1}. {ind.deskripsi}</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-1 capitalize bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                        Indikator KKTP (Ceklis)
                      </div>
                    </th>
                  ));
                }
                
                if (k.jenis === "rubrik" && k.rubrik && k.rubrik.length > 0) {
                  const indicators = Array.from(new Set(k.rubrik.map(r => r.indikatorId).filter(Boolean))) as string[];
                  if (indicators.length > 0) {
                    return indicators.map((indId, i) => (
                      <th key={`${k.kktpId}-${indId}`} className="px-4 py-3 font-semibold border-r border-slate-200 min-w-[150px] max-w-[250px]">
                        <div className="truncate text-[11px] text-slate-500 mb-1" title={k.nama}>{k.nama}</div>
                        <div className="line-clamp-2 text-sm text-blue-700 leading-tight" title={indId}>{i+1}. {indId}</div>
                        <div className="text-[10px] font-normal text-slate-400 mt-1 capitalize bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                          Indikator KKTP (Rubrik)
                        </div>
                      </th>
                    ));
                  }
                }
                
                return (
                  <th key={k.kktpId} className="px-4 py-3 font-semibold border-r border-slate-200 min-w-[150px] max-w-[200px]">
                    <div className="truncate" title={k.nama}>{k.nama}</div>
                    <div className="text-xs font-normal text-slate-500 mt-1 capitalize bg-slate-100 p-1 rounded inline-block">
                      {k.jenis} • {k.bobot}%
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {availableMurid.map((m, idx) => (
              <tr key={m.muridId} className={`border-b border-slate-100 hover:bg-blue-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <td className="px-4 py-2 border-r border-slate-200 sticky left-0 bg-inherit z-10">
                  <div className="font-medium text-slate-800">{m.nama}</div>
                  <div className="text-xs text-slate-500">NISN: {m.nisn} | {m.jenisKelamin}</div>
                </td>
                {availableKktp.map(k => {
                  if (k.jenis === "deskripsi" && k.indikator && k.indikator.length > 0) {
                    return k.indikator.map(ind => (
                      <td key={`${k.kktpId}-${ind.indikatorId}`} className="px-2 py-2 border-r border-slate-200 align-top">
                        {renderIndicatorInput(m.muridId, k, ind)}
                      </td>
                    ))
                  }
                  
                  if (k.jenis === "rubrik" && k.rubrik && k.rubrik.length > 0) {
                    const indicators = Array.from(new Set(k.rubrik.map(r => r.indikatorId).filter(Boolean))) as string[];
                    if (indicators.length > 0) {
                      return indicators.map(indId => (
                        <td key={`${k.kktpId}-${indId}`} className="px-2 py-2 border-r border-slate-200 align-top">
                          {renderRubrikIndicatorInput(m.muridId, k, indId)}
                        </td>
                      ))
                    }
                  }
                  
                  return (
                    <td key={k.kktpId} className="px-2 py-2 border-r border-slate-200 align-top">
                      {renderInput(m.muridId, k)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Simpan Nilai Sumatif"
        description="Apakah Anda yakin ingin menyimpan perubahan nilai ini? Pastikan semua kolom yang diperlukan sudah terisi."
        onConfirm={confirmSave}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Ya, Simpan"
      />
    </div>
  );
}
