import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { AsesmenFormatif } from "@/types";
import { ToastNotifier } from "@/components/shared/ToastNotifier";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { Activity, Smile } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RefleksiTabProps {
  kelasId: string;
  muridId: string;
  tpId: string;
}

const EMOJIS = [
  { value: 1, label: "Sangat Kurang", emoji: "😞", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  { value: 2, label: "Kurang", emoji: "😐", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  { value: 3, label: "Baik", emoji: "🙂", color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
  { value: 4, label: "Sangat Baik", emoji: "😄", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" }
];

export function RefleksiTab({ kelasId, muridId, tpId }: RefleksiTabProps) {
  const { formatif, updateFormatif } = useMasterData();
  
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    penilaianDiri: 0,
    penilaianTeman: 0
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const existingData = formatif.filter(f => 
    f.jenis === "refleksi" && 
    (kelasId ? f.kelasId === kelasId : true) &&
    (muridId ? f.muridId === muridId : true)
  ).sort((a,b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()); // sort asc for chart

  const chartData = existingData.map(item => {
    const data = item.data as any;
    return {
      name: format(new Date(item.tanggal), 'dd/MM'),
      "Penilaian Diri": data.penilaianDiri,
      "Penilaian Teman": data.penilaianTeman || null,
      fullDate: item.tanggal
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasId || !muridId) {
      ToastNotifier.error("Harap pilih Kelas dan Murid terlebih dahulu di bagian atas.");
      return;
    }
    if (formData.penilaianDiri === 0) {
      ToastNotifier.error("Penilaian diri wajib diisi.");
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
      jenis: "refleksi",
      tanggal: formData.tanggal,
      catatan: "",
      data: {
        penilaianDiri: formData.penilaianDiri,
        penilaianTeman: formData.penilaianTeman === 0 ? undefined : formData.penilaianTeman
      } as any,
      createdBy: "current-user"
    };

    updateFormatif([...formatif, newDoc]);
    ToastNotifier.success("Refleksi murid berhasil disimpan.");
    
    setFormData({ ...formData, penilaianDiri: 0, penilaianTeman: 0 });
    setConfirmOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <div className="w-full md:w-5/12">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Input Refleksi</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Penilaian Diri Sendiri <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EMOJIS.map(em => (
                <button
                  key={`diri-${em.value}`}
                  type="button"
                  onClick={() => setFormData({...formData, penilaianDiri: em.value})}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                    formData.penilaianDiri === em.value 
                      ? `${em.bg} ${em.border} ring-2 ring-blue-500` 
                      : 'bg-white border-slate-200 hover:bg-slate-50 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'
                  }`}
                  style={formData.penilaianDiri === em.value ? {filter: 'grayscale(0)'} : {}}
                >
                  <span className="text-3xl mb-1">{em.emoji}</span>
                  <span className={`text-[10px] font-medium text-center ${formData.penilaianDiri === em.value ? em.color : 'text-slate-500'}`}>
                    {em.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Penilaian Teman (Opsional)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EMOJIS.map(em => (
                <button
                  key={`teman-${em.value}`}
                  type="button"
                  onClick={() => setFormData({...formData, penilaianTeman: formData.penilaianTeman === em.value ? 0 : em.value})}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                    formData.penilaianTeman === em.value 
                      ? `${em.bg} ${em.border} ring-2 ring-blue-500` 
                      : 'bg-white border-slate-200 hover:bg-slate-50 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'
                  }`}
                  style={formData.penilaianTeman === em.value ? {filter: 'grayscale(0)'} : {}}
                >
                  <span className="text-3xl mb-1">{em.emoji}</span>
                  <span className={`text-[10px] font-medium text-center ${formData.penilaianTeman === em.value ? em.color : 'text-slate-500'}`}>
                    {em.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
          >
            Simpan Refleksi
          </button>
        </form>
      </div>

      <div className="w-full md:w-7/12">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Grafik Perkembangan Refleksi
        </h3>
        
        {!muridId ? (
          <div className="text-center text-slate-500 py-20 bg-slate-50 rounded-lg border border-slate-200">
            <Smile className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p>Pilih murid untuk melihat grafik refleksi.</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center text-slate-500 py-20 bg-slate-50 rounded-lg border border-slate-200">
            <p>Belum ada data refleksi untuk murid ini.</p>
          </div>
        ) : (
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                  <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="Penilaian Diri" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Penilaian Teman" stroke="#10B981" strokeWidth={3} strokeDasharray="5 5" connectNulls />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                   <span className="text-slate-600">Diri Sendiri</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white ring-1 ring-green-500 border-dashed"></div>
                   <span className="text-slate-600">Teman</span>
                </div>
              </div>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={confirmOpen}
        title="Simpan Refleksi Murid"
        description="Apakah Anda yakin ingin menyimpan respon refleksi ini?"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Simpan"
        cancelLabel="Batal"
      />
    </div>
  );
}
