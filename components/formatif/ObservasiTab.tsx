import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { AsesmenFormatif } from "@/types";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { Calendar, User } from "lucide-react";

interface ObservasiTabProps {
  kelasId: string;
  muridId: string;
  tpId: string;
}

export function ObservasiTab({ kelasId, muridId, tpId }: ObservasiTabProps) {
  const { formatif, updateFormatif, murid } = useMasterData();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    aspek: "",
    frekuensi: 1,
    tanggal: new Date().toISOString().split('T')[0],
    catatan: ""
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  // Filter existing data for this murid and TP (if chosen), or just murid
  const existingData = formatif.filter(f => 
    f.jenis === "observasi" && 
    (kelasId ? f.kelasId === kelasId : true) &&
    (muridId ? f.muridId === muridId : true)
  ).sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasId || !muridId || !tpId) {
      ToastNotifier.error("Harap pilih Kelas, Murid, dan TP terlebih dahulu di bagian atas.");
      return;
    }
    
    if (!formData.aspek) {
      ToastNotifier.error("Aspek yang diamati wajib diisi.");
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    const newDoc: AsesmenFormatif = {
      asesmenId: `fmt-${Date.now()}`,
      muridId,
      kelasId,
      tpId,
      jenis: "observasi",
      tanggal: formData.tanggal,
      catatan: formData.catatan,
      data: {
        aspek: formData.aspek,
        frekuensi: Number(formData.frekuensi)
      },
      createdBy: "current-user"
    };

    updateFormatif([...formatif, newDoc]);
    ToastNotifier.success("Observasi Harian berhasil disimpan.");
    
    // Reset form selectively
    setFormData({ ...formData, aspek: "", catatan: "", frekuensi: 1 });
    setConfirmOpen(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Form Input */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Input Observasi</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
            <input 
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aspek yang Diamati <span className="text-red-500">*</span></label>
            <input 
              type="text"
              value={formData.aspek}
              onChange={(e) => setFormData({...formData, aspek: e.target.value})}
              placeholder="Contoh: Keaktifan bertanya, Kerjasama kelompok"
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Frekuensi Kemunculan</label>
            <input 
              type="number"
              min="1"
              value={formData.frekuensi}
              onChange={(e) => setFormData({...formData, frekuensi: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
            <p className="text-xs text-slate-500 mt-1">Berapa kali aspek ini terlihat dalam sesi pembelajaran?</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan</label>
            <textarea 
              rows={3}
              value={formData.catatan}
              onChange={(e) => setFormData({...formData, catatan: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              placeholder="Deskripsi singkat kejadian..."
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
          >
            Simpan Observasi
          </button>
        </form>
      </div>

      {/* Timeline view */}
      <div className="border-l border-slate-200 pl-6 h-full min-h-[400px] overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Riwayat Observasi</h3>
        {existingData.length === 0 ? (
          <div className="text-center text-slate-500 py-10">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p>Belum ada riwayat observasi.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {existingData.map(item => {
              const data = item.data as { asprk: string, frekuensi: number, aspek?: string }; // type guard helper
              const m = murid.find(x => x.muridId === item.muridId);
              return (
                <div key={item.asesmenId} className="relative pl-6 border-l-2 border-blue-200 before:absolute before:left-[-5px] before:top-1 before:w-2.5 before:h-2.5 before:bg-blue-500 before:rounded-full">
                  <div className="text-xs text-slate-500 mb-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded">
                    {format(new Date(item.tanggal), 'dd MMMM yyyy', { locale: id })}
                  </div>
                  <div className="bg-white border text-sm border-slate-200 rounded-md p-3 shadow-sm mt-1">
                    {!muridId && m && (
                      <div className="font-semibold text-slate-800 flex items-center gap-1 mb-2 border-b pb-2">
                        <User className="w-3 h-3 text-slate-400" /> {m.nama}
                      </div>
                    )}
                    <h4 className="font-semibold text-slate-800">{data.aspek}</h4>
                    <p className="text-slate-600 text-xs mt-1">Frekuensi: {data.frekuensi}x</p>
                    {item.catatan && (
                      <p className="text-slate-700 italic border-l-2 border-slate-300 pl-2 mt-2">&quot;{item.catatan}&quot;</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={confirmOpen}
        title="Simpan Observasi"
        description="Apakah Anda yakin ingin menyimpan catatan observasi harian ini?"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Ya, Simpan"
        cancelLabel="Batal"
      />
    </div>
  );
}
