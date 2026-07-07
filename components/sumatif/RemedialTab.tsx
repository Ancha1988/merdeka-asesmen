import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { Intervensi } from "@/types";
import { FileEdit, CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface RemedialTabProps {
  kelasId: string;
  tpId: string;
}

export function RemedialTab({ kelasId, tpId }: RemedialTabProps) {
  const { murid, pengolahanNilai, updatePengolahanNilai, intervensi, updateIntervensi } = useMasterData();
  
  const [editingIntervensi, setEditingIntervensi] = useState<Partial<Intervensi> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cari data pengolahan nilai untuk kelas & TP ini
  const relevantPengolahan = pengolahanNilai.filter(p => {
    if (p.tpId !== tpId) return false;
    const m = murid.find(x => x.muridId === p.muridId);
    return m?.kelasId === kelasId && m.status === 'aktif';
  });

  const getMuridInfo = (muridId: string) => murid.find(m => m.muridId === muridId);

  const studentsNeedsIntervention = relevantPengolahan.map(p => {
    const info = getMuridInfo(p.muridId);
    // threshold logic: tuntas is >= 70. Use raw/original score if it exists to recommend the remedial correctly
    const originalScore = p.nilaiAsli !== undefined && p.nilaiAsli !== null ? p.nilaiAsli : p.nilaiAkhir;
    const isTuntas = p.isTuntas !== undefined ? p.isTuntas : originalScore >= 70;
    const isSangatBaik = originalScore >= 90;
    const kind = isTuntas ? (isSangatBaik ? "pengayaan" : null) : "remedial";
    
    const existing = intervensi.find(i => i.muridId === p.muridId && i.tpId === tpId);
    
    return {
      pengolahanId: p.pengolahanId,
      muridId: p.muridId,
      nama: info?.nama || "-",
      nisn: info?.nisn || "-",
      nilaiAkhir: originalScore,
      rekomendasiJenis: kind,
      intervensi: existing
    };
  }).filter(x => x.rekomendasiJenis !== null || x.intervensi); // Only those who need OR currently have intervention

  const handleOpenForm = (mId: string, rekomendasiJenis: string, forcedStatus?: "direncanakan" | "berjalan" | "selesai") => {
    const existing = intervensi.find(i => i.muridId === mId && i.tpId === tpId);
    const p = relevantPengolahan.find(x => x.muridId === mId);
    const originalScore = p ? (p.nilaiAsli !== undefined && p.nilaiAsli !== null ? p.nilaiAsli : p.nilaiAkhir) : 0;

    if (existing) {
      setEditingIntervensi({
        ...existing,
        nilaiAsli: existing.nilaiAsli ?? originalScore,
        status: forcedStatus || existing.status,
        nilaiRemedial: existing.nilaiRemedial ?? (forcedStatus === "selesai" || existing.status === "selesai" ? 75 : null)
      });
    } else {
      setEditingIntervensi({
        muridId: mId,
        tpId,
        jenis: rekomendasiJenis as "remedial" | "pengayaan",
        status: forcedStatus || "direncanakan",
        tanggalMulai: new Date().toISOString().split('T')[0],
        rencana: "",
        nilaiAsli: originalScore,
        nilaiRemedial: forcedStatus === "selesai" ? 75 : null
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveIntervensi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIntervensi?.rencana) {
      ToastNotifier.error("Rencana tindak lanjut wajib diisi.");
      return;
    }

    if (editingIntervensi.jenis === "remedial" && editingIntervensi.status === "selesai") {
      if (editingIntervensi.nilaiRemedial === undefined || editingIntervensi.nilaiRemedial === null || (editingIntervensi.nilaiRemedial as any) === "") {
        ToastNotifier.error("Nilai hasil remedial wajib diisi saat status selesai.");
        return;
      }
      const val = Number(editingIntervensi.nilaiRemedial);
      if (isNaN(val) || val < 0 || val > 100) {
        ToastNotifier.error("Nilai remedial harus berupa angka antara 0-100.");
        return;
      }
    }

    let newIntervensiList = [...intervensi];
    const originalScore = editingIntervensi.nilaiAsli ?? 0;
    
    const preparedIntervensi: Intervensi = {
      intervensiId: editingIntervensi.intervensiId || `int-${Date.now()}`,
      muridId: editingIntervensi.muridId!,
      tpId: editingIntervensi.tpId!,
      jenis: editingIntervensi.jenis as any,
      status: editingIntervensi.status as any,
      rencana: editingIntervensi.rencana,
      tanggalMulai: editingIntervensi.tanggalMulai!,
      tanggalSelesai: editingIntervensi.status === 'selesai' ? (editingIntervensi.tanggalSelesai || new Date().toISOString().split('T')[0]) : null,
      nilaiAsli: originalScore,
      nilaiRemedial: editingIntervensi.jenis === "remedial" && editingIntervensi.status === "selesai" ? Number(editingIntervensi.nilaiRemedial) : null
    };

    if (editingIntervensi.intervensiId) {
      // Update
      newIntervensiList = newIntervensiList.map(i => 
        i.intervensiId === editingIntervensi.intervensiId ? preparedIntervensi : i
      );
    } else {
      // Create new
      newIntervensiList.push(preparedIntervensi);
    }

    updateIntervensi(newIntervensiList);

    // Sync to pengolahanNilai if remedial is finished
    if (preparedIntervensi.status === "selesai" && preparedIntervensi.jenis === "remedial" && preparedIntervensi.nilaiRemedial !== null) {
      const updatedPengolahan = pengolahanNilai.map(p => {
        if (p.muridId === preparedIntervensi.muridId && p.tpId === preparedIntervensi.tpId) {
          return {
            ...p,
            nilaiAsli: p.nilaiAsli ?? p.nilaiAkhir, // preserve original score
            nilaiAkhir: preparedIntervensi.nilaiRemedial!
          };
        }
        return p;
      });
      updatePengolahanNilai(updatedPengolahan);
    }

    ToastNotifier.success("Rencana & Nilai intervensi berhasil disimpan.");
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: "berjalan" | "selesai") => {
    let targetIntervensi: Intervensi | null = null;
    const list = intervensi.map(i => {
      if (i.intervensiId === id) {
        const isRemedial = i.jenis === "remedial";
        const isSelesai = newStatus === "selesai";
        const updated = { 
          ...i, 
          status: newStatus,
          tanggalSelesai: isSelesai ? new Date().toISOString().split('T')[0] : i.tanggalSelesai,
          nilaiRemedial: isRemedial && isSelesai ? (i.nilaiRemedial ?? 75) : i.nilaiRemedial
        };
        targetIntervensi = updated;
        return updated;
      }
      return i;
    });

    updateIntervensi(list);

    if (targetIntervensi && (targetIntervensi as Intervensi).status === "selesai" && (targetIntervensi as Intervensi).jenis === "remedial") {
      const score = (targetIntervensi as Intervensi).nilaiRemedial ?? 75;
      const updatedPengolahan = pengolahanNilai.map(p => {
        if (p.muridId === (targetIntervensi as Intervensi).muridId && p.tpId === (targetIntervensi as Intervensi).tpId) {
          return {
            ...p,
            nilaiAsli: p.nilaiAsli ?? p.nilaiAkhir,
            nilaiAkhir: score
          };
        }
        return p;
      });
      updatePengolahanNilai(updatedPengolahan);
    }

    ToastNotifier.success(`Status diperbarui menjadi: ${newStatus}`);
  };

  if (!kelasId || !tpId) {
    return (
      <div className="p-10 text-center text-slate-500">
        Silakan pilih Kelas dan TP terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex gap-3 text-sm">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <p>Sistem ini mendeteksi murid yang memerlukan Remedial (Belum Tuntas) dan yang berhak mendapat Pengayaan (Tuntas &amp; Nilai &ge; 90) berdasarkan hasil Pengolahan Nilai.</p>
      </div>

      <div className="space-y-4">
        {studentsNeedsIntervention.length === 0 ? (
          <div className="text-center p-10 border border-dashed border-slate-300 rounded-lg text-slate-500">
            Tidak ada murid yang memerlukan remedial atau pengayaan berdasarkan nilai saat ini.
            Atau Anda belum menghitung nilai akhir di tab &quot;Pengolahan Nilai&quot;.
          </div>
        ) : (
           studentsNeedsIntervention.map((item) => (
            <div key={item.muridId} className="bg-white border text-sm border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-slate-800">{item.nama}</span>
                  <span className="text-slate-500 text-xs mt-1">({item.nisn})</span>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">Nilai Asli: {item.nilaiAkhir}</span>
                  {item.intervensi?.status === 'selesai' && item.intervensi.jenis === 'remedial' && (
                    <span className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded font-bold">
                      Nilai Remedial: {item.intervensi.nilaiRemedial ?? "-"}
                    </span>
                  )}
                  {item.rekomendasiJenis === 'remedial' ? (
                    <span className="text-red-700 bg-red-100 px-2 py-1 rounded font-semibold uppercase text-xs tracking-wider">Butuh Remedial</span>
                  ) : (
                    <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded font-semibold uppercase text-xs tracking-wider">Saran Pengayaan</span>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto h-full flex items-center justify-end">
                {!item.intervensi ? (
                   <button
                    onClick={() => handleOpenForm(item.muridId, item.rekomendasiJenis!)}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 w-full md:w-auto mt-2 md:mt-0 flex items-center justify-center gap-2"
                   >
                     Buat Rencana Intervensi <ChevronRight className="w-4 h-4" />
                   </button>
                ) : (
                   <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                      <div className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide flex items-center gap-1 border
                        ${item.intervensi.status === 'direncanakan' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                        ${item.intervensi.status === 'berjalan' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${item.intervensi.status === 'selesai' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      `}>
                         {item.intervensi.status}
                      </div>
                      
                      <button 
                        onClick={() => handleOpenForm(item.muridId, item.intervensi!.jenis)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Rencana"
                      >
                         <FileEdit className="w-5 h-5" />
                      </button>

                      {item.intervensi.status === 'direncanakan' && (
                        <button 
                          onClick={() => handleUpdateStatus(item.intervensi!.intervensiId, 'berjalan')}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded bg-white shadow-sm border border-slate-200 ml-1"
                          title="Mulai Intervensi"
                        >
                          <PlayCircle className="w-5 h-5" />
                        </button>
                      )}
                      {item.intervensi.status === 'berjalan' && (
                        <button 
                          onClick={() => handleOpenForm(item.muridId, item.intervensi!.jenis, 'selesai')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded bg-white shadow-sm border border-slate-200 ml-1 flex items-center gap-1 text-xs font-semibold px-2"
                          title="Selesaikan & Input Nilai Remedial"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Selesaikan
                        </button>
                      )}
                   </div>
                )}
              </div>
            </div>
           ))
        )}
      </div>

      {/* Form Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg rounded-xl">
            <div className="flex flex-col space-y-1 text-center sm:text-left mb-2">
              <Dialog.Title className="text-xl font-bold leading-none tracking-tight text-slate-800">
                {editingIntervensi?.intervensiId ? 'Edit Rencana Intervensi' : 'Buat Rencana Intervensi Baru'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500 mt-2">
                 Murid: <span className="font-semibold text-slate-700">{getMuridInfo(editingIntervensi?.muridId || "")?.nama}</span>
              </Dialog.Description>
            </div>

            {editingIntervensi && (
              <form onSubmit={handleSaveIntervensi} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jenis</label>
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 capitalize">
                      {editingIntervensi.jenis}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                      value={editingIntervensi.status}
                      onChange={(e) => setEditingIntervensi({...editingIntervensi, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 capitalize"
                    >
                      <option value="direncanakan">Direncanakan</option>
                      <option value="berjalan">Berjalan</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  </div>
                </div>

                {editingIntervensi.jenis === "remedial" && editingIntervensi.status === "selesai" && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <div className="flex justify-between text-xs text-blue-900 font-medium">
                      <span>Nilai Asli Pengolahan: {editingIntervensi.nilaiAsli ?? "-"}</span>
                      <span>Status: Tuntas sesuai KKTP</span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-950 mb-1">
                        Nilai Hasil Remedial <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Masukkan nilai hasil remedial (0-100)"
                        value={editingIntervensi.nilaiRemedial !== null && editingIntervensi.nilaiRemedial !== undefined ? editingIntervensi.nilaiRemedial : ""}
                        onChange={(e) => setEditingIntervensi({
                          ...editingIntervensi, 
                          nilaiRemedial: e.target.value === "" ? null : Number(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-blue-300 rounded bg-white font-bold text-center text-blue-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-blue-700 mt-1 italic">
                        *Nilai remedial akan disimpan seiring nilai asli untuk menjaga transparansi data.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                  <input 
                    type="date"
                    value={editingIntervensi.tanggalMulai || ""}
                    onChange={(e) => setEditingIntervensi({...editingIntervensi, tanggalMulai: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rencana Kegiatan <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={4}
                    value={editingIntervensi.rencana || ""}
                    onChange={(e) => setEditingIntervensi({...editingIntervensi, rencana: e.target.value})}
                    placeholder={editingIntervensi.jenis === 'remedial' ? "Contoh: Bimbingan perorangan membahas konsep dasar..." : "Contoh: Pemberian materi pengayaan tingkat lanjut..."}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-slate-700 rounded-md font-medium hover:bg-slate-50">
                    Batal
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
                    Simpan Rencana &amp; Nilai
                  </button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
