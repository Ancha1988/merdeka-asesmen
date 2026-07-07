import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { AsesmenFormatif } from "@/types";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { MessagesSquare, User } from "lucide-react";

interface CatsTabProps {
  kelasId: string;
  muridId: string;
  tpId: string;
}

const TEMPLATES = [
  { id: "minute_paper", label: "Minute Paper", desc: "Apa 1 hal paling penting yang kamu pelajari hari ini?" },
  { id: "exit_ticket", label: "Exit Ticket", desc: "Rangkuman singkat atau jawaban 1 soal pemahaman." },
  { id: "muddiest_point", label: "Muddiest Point", desc: "Bagian mana yang paling membingungkan?" },
  { id: "custom", label: "Lainnya", desc: "Catatan khusus lainnya." }
];

export function CatsTab({ kelasId, muridId, tpId }: CatsTabProps) {
  const { formatif, updateFormatif, murid } = useMasterData();
  
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    strategi: "minute_paper",
    hasil: ""
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const existingData = formatif.filter(f => 
    f.jenis === "cats" && 
    (kelasId ? f.kelasId === kelasId : true) &&
    (muridId ? f.muridId === muridId : true)
  ).sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasId || !muridId) {
      ToastNotifier.error("Harap pilih Kelas dan Murid terlebih dahulu di bagian atas.");
      return;
    }
    if (!formData.hasil) {
      ToastNotifier.error("Hasil/Respon wajib diisi.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    const newDoc: AsesmenFormatif = {
      asesmenId: `fmt-${Date.now()}`,
      muridId,
      kelasId,
      tpId: tpId || "general",
      jenis: "cats",
      tanggal: formData.tanggal,
      catatan: "",
      data: {
        strategi: formData.strategi,
        hasil: formData.hasil
      } as any,
      createdBy: "current-user"
    };

    updateFormatif([...formatif, newDoc]);
    ToastNotifier.success("Data CATs berhasil disimpan.");
    
    setFormData({ ...formData, hasil: "" });
    setConfirmOpen(false);
  };

  const selectedTemplate = TEMPLATES.find(t => t.id === formData.strategi);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <div className="w-full md:w-1/2">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Classroom Assessment Techniques (CATs)</h3>
        
        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
          Teknik asesmen singkat untuk mengecek pemahaman murid di akhir/tengah sesi pembelajaran.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Strategi / Template</label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({...formData, strategi: t.id})}
                  className={`px-3 py-2 text-sm border rounded-md text-left transition-colors ${
                    formData.strategi === t.id 
                      ? 'bg-blue-100 border-blue-500 text-blue-900 font-medium' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hasil / Respon Murid <span className="text-red-500">*</span>
            </label>
            {selectedTemplate && (
              <p className="text-xs text-slate-500 mb-2 italic">Prompt: &quot;{selectedTemplate.desc}&quot;</p>
            )}
            <textarea 
              rows={3}
              value={formData.hasil}
              onChange={(e) => setFormData({...formData, hasil: e.target.value})}
              placeholder="Tuliskan respon atau temuan di sini..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
          >
            Simpan Hasil CATs
          </button>
        </form>
      </div>

      <div className="w-full md:w-1/2">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MessagesSquare className="w-5 h-5" /> Riwayat CATs
        </h3>
        
        {existingData.length === 0 ? (
          <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg border border-slate-200">
            <p>Belum ada rekaman CATs.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {existingData.map(item => {
              const data = item.data as any;
              const m = murid.find(x => x.muridId === item.muridId);
              const tpl = TEMPLATES.find(t => t.id === data.strategi);
              
              return (
                <div key={item.asesmenId} className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2 border-b pb-2">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <User className="w-4 h-4 text-slate-400" /> {m?.nama}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                      {tpl?.label || data.strategi}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                    <span>{format(new Date(item.tanggal), 'dd MMM yyyy', { locale: id })}</span>
                  </div>
                  
                  <div className="text-sm text-slate-700 p-2 bg-slate-50 rounded italic border-l-2 border-slate-300 whitespace-pre-wrap">
                    &quot;{data.hasil}&quot;
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={confirmOpen}
        title="Simpan Data CATs"
        description="Apakah Anda yakin ingin menyimpan respon murid ini?"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Simpan"
        cancelLabel="Batal"
      />
    </div>
  );
}
