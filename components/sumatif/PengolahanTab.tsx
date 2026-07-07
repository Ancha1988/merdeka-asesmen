import { useState, useMemo } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PengolahanNilai } from "@/types";
import { Calculator } from "lucide-react";

interface PengolahanTabProps {
  kelasId: string;
  tpId: string;
}

export function PengolahanTab({ kelasId, tpId }: PengolahanTabProps) {
  const { kelas, murid, tp, kktp, sumatif, pengolahanNilai, updatePengolahanNilai, intervensi } = useMasterData();
  
  const [metode, setMetode] = useState<"rata_rata" | "pembobotan">("pembobotan");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const activeKelas = kelas.find(k => k.kelasId === kelasId);
  const activeTp = tp.find(t => t.tpId === tpId);
  const availableMurid = murid.filter(m => m.kelasId === kelasId && m.status === 'aktif');
  const availableKktp = kktp.filter(k => k.tpId === tpId);

  const getKktpStatus = (muridId: string, k: any): { nilai: number, tuntas: boolean } => {
    const s = sumatif.find(x => x.kelasId === kelasId && x.tpId === tpId && x.muridId === muridId && x.kktpId === k.kktpId);
    if (!s) return { nilai: 0, tuntas: false };

    if (k.jenis === "deskripsi" && s.nilaiDeskripsi) {
      try {
        const checks = JSON.parse(s.nilaiDeskripsi);
        if (typeof checks === "object") {
          const totalChecks = Object.values(checks).filter(Boolean).length;
          const minKriteria = k.minKriteriaTuntas || 1;
          const totalInd = k.indikator?.length || 1;
          
          const nilai = Math.round((totalChecks / totalInd) * 100);
          const tuntas = totalChecks >= minKriteria;
          return { nilai, tuntas };
        }
      } catch (e) {
        // fallback to normal if parsing fails
      }
    }

    // Default processing for other types
    let nilai = 0;
    if (s.formatInput === "angka") {
      nilai = s.nilaiAngka || 0;
    } else if (s.formatInput === "deskripsi" && s.nilaiDeskripsi) {
      if (s.nilaiDeskripsi === "BB") nilai = 50;
      else if (s.nilaiDeskripsi === "L") nilai = 70;
      else if (s.nilaiDeskripsi === "C") nilai = 85;
      else if (s.nilaiDeskripsi === "M") nilai = 100;
      else nilai = 75;
    }
    
    // For non-deskripsi types, assuming >= 70 is tuntas
    const tuntas = nilai >= 70; 

    return { nilai, tuntas };
  };

  // Calculate projected final values
  const calculations = useMemo(() => {
    if (!kelasId || !tpId) return [];
    
    return availableMurid.map(m => {
      let totalBobot = 0;
      let sumNilaiRata = 0;
      let count = 0;
      let sumNilaiBobot = 0;

      let allKktpTuntas = true;
      let hasAnyKktp = false;

      const details = availableKktp.map(k => {
        const status = getKktpStatus(m.muridId, k);
        const val = status.nilai;
        if (!status.tuntas) allKktpTuntas = false;
        hasAnyKktp = true;

        sumNilaiRata += val;
        count++;
        
        sumNilaiBobot += (val * (k.bobot / 100));
        totalBobot += k.bobot;
        
        return {
          kktpId: k.kktpId,
          namaKktp: k.nama,
          bobot: k.bobot,
          nilai: val,
          kontribusi: metode === "pembobotan" ? (val * (k.bobot / 100)) : val
        };
      });

      const nilaiAkhirRaw = metode === "rata_rata" 
        ? (count > 0 ? sumNilaiRata / count : 0) 
        : (totalBobot > 0 ? (sumNilaiBobot / (totalBobot / 100)) : 0);

      const roundedRaw = Math.round(nilaiAkhirRaw * 100) / 100;

      // Check if there is a completed remedial intervention for this student with a remedial score
      const extIntervensi = intervensi.find(i => i.muridId === m.muridId && i.tpId === tpId && i.jenis === "remedial" && i.status === "selesai");
      const hasRemedial = extIntervensi && extIntervensi.nilaiRemedial !== null && extIntervensi.nilaiRemedial !== undefined;
      const nilaiAkhir = hasRemedial ? Number(extIntervensi.nilaiRemedial) : roundedRaw;
      const tuntas = hasRemedial ? (nilaiAkhir >= 70) : (hasAnyKktp ? allKktpTuntas : false);

      return {
        muridId: m.muridId,
        nama: m.nama,
        nisn: m.nisn,
        details,
        nilaiAkhir: Math.round(nilaiAkhir * 100) / 100,
        nilaiAsli: hasRemedial ? roundedRaw : null,
        tuntas,
        hasRemedial
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kelasId, tpId, metode, availableMurid, availableKktp, sumatif, intervensi]);

  // Statistik Kelas
  const stats = useMemo(() => {
    if (calculations.length === 0) return null;
    const finalScores = calculations.map(c => c.nilaiAkhir);
    return {
      rata: (finalScores.reduce((a,b) => a + b, 0) / finalScores.length).toFixed(2),
      tertinggi: Math.max(...finalScores).toFixed(2),
      terendah: Math.min(...finalScores).toFixed(2),
      tuntas: calculations.filter(c => c.tuntas).length,
      tidakTuntas: calculations.filter(c => !c.tuntas).length,
    };
  }, [calculations]);

  const handleSave = () => {
    if (!kelasId || !tpId) return;
    setConfirmOpen(true);
  };

  const confirmSave = () => {
    const filteredPengolahan = pengolahanNilai.filter(p => !(p.muridId && p.tpId === tpId && murid.find(m => m.muridId === p.muridId)?.kelasId === kelasId));
    
    const newPengolahan: PengolahanNilai[] = calculations.map(c => ({
      pengolahanId: `png-${Date.now()}-${c.muridId}-${tpId}`,
      muridId: c.muridId,
      tpId,
      metode,
      nilaiAkhir: c.nilaiAkhir,
      nilaiAsli: c.nilaiAsli,
      isTuntas: c.tuntas,
      detail: c.details.map(d => ({
        kktpId: d.kktpId,
        bobot: d.bobot,
        nilai: d.nilai,
        kontribusi: d.kontribusi
      }))
    }));

    updatePengolahanNilai([...filteredPengolahan, ...newPengolahan]);
    ToastNotifier.success("Nilai akhir berhasil dihitung dan disimpan.");
    setConfirmOpen(false);
  };

  if (!kelasId || !tpId) {
    return (
      <div className="p-10 text-center text-slate-500">
        Silakan pilih Kelas dan TP terlebih dahulu untuk mengolah nilai.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-medium text-slate-800 mb-2">Pilih Metode Pengolahan Nilai Akhir</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="metode" 
                value="pembobotan"
                checked={metode === "pembobotan"}
                onChange={(e) => setMetode(e.target.value as any)}
                className="text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-700">Proporsional (Sesuai Bobot KKTP)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="metode" 
                value="rata_rata"
                checked={metode === "rata_rata"}
                onChange={(e) => setMetode(e.target.value as any)}
                className="text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-700">Rata-rata (Semua KKTP sama)</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-blue-700"
        >
          <Calculator className="w-5 h-5" /> Hitung & Simpan Nilai Akhir
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-500 font-medium">Rata-rata Kelas</div>
            <div className="text-xl font-bold text-blue-600 mt-1">{stats.rata}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-500 font-medium">Nilai Tertinggi</div>
            <div className="text-xl font-bold text-green-600 mt-1">{stats.tertinggi}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-500 font-medium">Nilai Terendah</div>
            <div className="text-xl font-bold text-red-600 mt-1">{stats.terendah}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-500 font-medium">Siswa Tuntas</div>
            <div className="text-xl font-bold text-emerald-600 mt-1">{stats.tuntas}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-500 font-medium">Belum Tuntas</div>
            <div className="text-xl font-bold text-amber-600 mt-1">{stats.tidakTuntas}</div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold border-r border-slate-200 min-w-[200px]">Nama Murid</th>
              {availableKktp.map(k => (
                <th key={k.kktpId} className="px-3 py-3 font-medium border-r border-slate-200 text-center text-xs">
                  <div className="truncate mb-1" title={k.nama}>{k.nama}</div>
                  <div className="text-blue-600 font-semibold">{k.bobot}%</div>
                </th>
              ))}
              <th className="px-4 py-3 font-bold text-center bg-blue-50 text-blue-900 border-l border-blue-200">
                L/TT
              </th>
              <th className="px-4 py-3 font-bold text-center bg-blue-50 text-blue-900">
                Nilai Akhir
              </th>
            </tr>
          </thead>
          <tbody>
            {calculations.map((c, idx) => (
              <tr key={c.muridId} className={`border-b border-slate-100 hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                <td className="px-4 py-2 border-r border-slate-200">
                  <div className="font-medium text-slate-800">{c.nama}</div>
                  <div className="text-xs text-slate-500">NISN: {c.nisn}</div>
                </td>
                {c.details.map(d => (
                  <td key={d.kktpId} className="px-3 py-2 border-r border-slate-200 text-center font-medium text-slate-600">
                    {d.nilai}
                  </td>
                ))}
                <td className="px-4 py-2 text-center border-l border-slate-200">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${c.tuntas ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.tuntas ? 'T' : 'BT'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center bg-blue-50/30">
                  <div className="font-bold text-lg text-slate-800">{c.nilaiAkhir}</div>
                  {c.hasRemedial && c.nilaiAsli !== null && (
                    <div className="text-[10px] text-slate-500 font-semibold italic">Asli: {c.nilaiAsli}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Simpan Nilai Akhir"
        description="Apakah Anda yakin ingin menyimpan dan me-lock perhitungan nilai akhir ini untuk digunakan dalam Rapor?"
        onConfirm={confirmSave}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Ya, Simpan"
      />
    </div>
  );
}
