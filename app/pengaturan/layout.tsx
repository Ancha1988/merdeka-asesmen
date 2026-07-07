"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PengaturanLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuthStore();

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Akses Ditolak</h1>
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg">Khusus Administrator</h3>
            <p className="mt-1 text-sm">Anda tidak memiliki hak akses untuk mengelola menu Pengaturan. Menu ini hanya dapat diakses oleh akun yang memiliki peran admin.</p>
            <Link href="/" className="inline-block mt-4 text-red-600 font-medium hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
