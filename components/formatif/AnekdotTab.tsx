import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { AsesmenFormatif } from "@/types";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { BookOpen, User } from "lucide-react";

interface AnekdotTabProps {
  kelasId: string;
  muridId: string;
  tpId: string;
}

export function AnekdotTab({ kelasId, muridId, tpId }: AnekdotTabProps) {
  const { formatif, updateFormatif, murid } = useMasterData();
  
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    peristiwa: "",
    konteks: "",
    implikasi: ""
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const existingData = formatif.filter(f => 
    f.jenis === "anekdot" && 
    (kelasId ? f.kelasId === kelasId : true) &&
    (muridId ? f.muridId === muridId : true)
  ).sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasId || !muridId) {
      ToastNotifier.error("Harap pilih Kelas dan Murid terlebih dahulu di bagian atas.");
      return;
    }
    if (!formData.peristiwa) {
      ToastNotifier.error("Peristiwa wajib diisi.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    const newDoc: AsesmenFormatif = {
      asesmenId: `fmt-${Date.now()}`,
      muridId,
      kelasId,
      tpId: tpId || "general", // Anekdotal bisa tidak terikat TP spesifik
      jenis: "anekdot",
      tanggal: formData.tanggal,
      catatan: "", // kita simpan di data spesifik
      data: {
        peristiwa: formData.peristiwa,
        konteks: formData.konteks,
        implikasi: formData.implikasi
      } as any, // Cast to any to bypass strict union check dynamically
      createdBy: "current-user"
    };

    updateFormatif([...formatif, newDoc]);
    ToastNotifier.success("Catatan Anekdotal berhasil disimpan.");
    
    setFormData({ ...formData, peristiwa: "", konteks: "", implikasi: "" });
    setConfirmOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <div className="w-full md:w-1/2">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Input Catatan Anekdotal</h3>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Peristiwa (Fakta) <span className="text-red-500">*</span></label>
            <textarea 
              rows={2}
              value={formData.peristiwa}
              onChange={(e) => setFormData({...formData, peristiwa: e.target.value})}
              placeholder="Apa yang terjadi secara objektif?"
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konteks</label>
            <textarea 
              rows={2}
              value={formData.konteks}
              onChange={(e) => setFormData({...formData, konteks: e.target.value})}
              placeholder="Di mana, kapan, sedang apa, bersama siapa?"
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Implikasi / Tindak Lanjut</label>
            <textarea 
              rows={2}
              value={formData.implikasi}
              onChange={(e) => setFormData({...formData, implikasi: e.target.value})}
              placeholder="Apa artinya peristiwa ini untuk pembelajaran murid?"
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
          >
            Simpan Catatan
          </button>
        </form>
      </div>

      <div className="w-full md:w-1/2 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Arsip Anekdotal
        </h3>
        
        {existingData.length === 0 ? (
          <div className="text-center text-slate-500 py-10">
            <p>Belum ada rekaman anekdotal.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {existingData.map(item => {
              const data = item.data as any;
              const m = murid.find(x => x.muridId === item.muridId);
              return (
                <div key={item.asesmenId} className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2 border-b pb-2">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <User className="w-4 h-4 text-slate-400" /> {m?.nama}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {format(new Date(item.tanggal), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Peristiwa:</span>
                      <p className="text-sm text-slate-800 font-medium">{data.peristiwa}</p>
                    </div>
                    {data.konteks && (
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase">Konteks:</span>
                        <p className="text-sm text-slate-600">{data.konteks}</p>
                      </div>
                    )}
                    {data.implikasi && (
                      <div className="bg-blue-50 p-2 rounded text-sm text-blue-900">
                        <span className="font-semibold">Implikasi:</span> {data.implikasi}
                      </div>
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
        title="Simpan Catatan Anekdotal"
        description="Apakah Anda yakin ingin menyimpan catatan ini?"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Simpan"
        cancelLabel="Batal"
      />
    </div>
  );
}
