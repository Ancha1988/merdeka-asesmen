import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { z } from "zod";
import { Murid, Kelas, TahunAjaran } from "@/types";

interface ImportMuridModalProps {
  kelasList: Kelas[];
  tahunAjaranAktif: TahunAjaran;
  onSave: (newData: Murid[]) => void;
  onCancel: () => void;
}

export function ImportMuridModal({ kelasList, tahunAjaranAktif, onSave, onCancel }: ImportMuridModalProps) {
  const [inputText, setInputText] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [error, setError] = useState("");

  const handleImport = () => {
    setError("");
    if (!selectedKelas) {
      setError("Pilih kelas tujuan terlebih dahulu.");
      return;
    }
    
    if (!inputText.trim()) {
      setError("Data tidak boleh kosong.");
      return;
    }

    const lines = inputText.trim().split("\n");
    const parsedMurid: Murid[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Asumsi data: NISN \t Nama \t L/P (Atau koma)
        // Kita izinkan pemisah tab atau koma
        // Karena deskripsi fitur minta NISN, Nama, Jenis Kelamin. Kelas sudah kita pilih dari dropdown.
        let cols = line.split("\t");
        if (cols.length < 3) {
            cols = line.split(",");
        }
        
        if (cols.length < 3) {
            setError(`Format salah pada baris ${i + 1}. Pastikan ada NISN, Nama, dan L/P dipisah tab atau koma.`);
            return;
        }

        const nisn = cols[0].trim();
        const nama = cols[1].trim();
        const jkStr = cols[2].trim().toUpperCase();
        
        const jenisKelamin = jkStr.startsWith('P') ? 'P' : 'L';

        parsedMurid.push({
            muridId: `mrd-${Date.now()}-${i}-${Math.random().toString(36).substring(2,7)}`,
            nisn,
            nama,
            jenisKelamin,
            kelasId: selectedKelas,
            noHpOrtu: null,
            tahunMasuk: tahunAjaranAktif.tahunId,
            status: "aktif",
            riwayatKelas: [
              {
                 tahunId: tahunAjaranAktif.tahunId,
                 kelasId: selectedKelas,
                 tanggalMasuk: new Date().toISOString().split("T")[0],
                 tanggalKeluar: null,
                 alasan: "Impor Klasikal"
              }
            ]
        });
    }

    onSave(parsedMurid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Impor Data Murid</h2>
            <p className="text-sm text-slate-500 mt-1">Impor banyak murid sekaligus dengan copy-paste (Tab/Comma separated).</p>
          </div>
          <button onClick={onCancel} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kelas Tujuan</label>
            <select 
               value={selectedKelas} 
               onChange={(e) => setSelectedKelas(e.target.value)}
               className="w-full sm:w-1/2 p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
            >
               <option value="">-- Pilih Kelas Aktif --</option>
               {kelasList.map(k => (
                   <option key={k.kelasId} value={k.kelasId}>{k.namaKelas}</option>
               ))}
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Data Murid (Teks Copy-Paste dari Excel/CSV)</label>
             <p className="text-xs text-slate-500 mb-2">Format yang didukung: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">NISN [Tab/Koma] NAMA [Tab/Koma] L/P</span></p>
             <textarea 
                rows={10}
                className="w-full p-3 font-mono text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 whitespace-pre"
                placeholder={"123456\tBudi Santoso\tL\n654321\tSiti Aminah\tP"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
             />
          </div>

          <div className="text-sm text-slate-600 p-4 bg-blue-50 border border-blue-100 rounded-lg">
             <strong>Contoh format copy dari Excel (3 Kolom):</strong>
             <ul className="list-disc pl-5 mt-1 opacity-80">
                <li>Kolom 1: NISN</li>
                <li>Kolom 2: Nama Lengkap</li>
                <li>Kolom 3: Jenis Kelamin (Laki-laki / L / Perempuan / P)</li>
             </ul>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Proses Impor
          </button>
        </div>
      </div>
    </div>
  );
}
