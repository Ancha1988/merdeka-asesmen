"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { School, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAllowed } = useAuthStore();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // Pengecekan authorization (allowed_users) ditangani oleh AuthProvider
      // Jika mereka tidak disetujui, AuthProvider akan mengubah isAllowed menjadi false, tapi user tetap ada.
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal login dengan Google.");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
  }

  // Jika user sudah login dengan akun Google tapi tidak diizinkan masuk ke aplikasi
  if (user && !isAllowed) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Akses Ditolak</h1>
          <div className="text-slate-600 space-y-2">
            <p>Akun Google Anda (<strong>{user.email}</strong>) telah berhasil divalidasi, namun belum didaftarkan untuk menggunakan aplikasi ini.</p>
            <p>Silakan hubungi administrator sekolah Anda untuk meminta akses.</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
          >
            Keluar dan Coba Akun Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <School className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Merdeka Asesmen</h1>
          <p className="text-slate-500 text-sm">Masuk untuk mengelola penilaian dan data E-Rapor.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            {isLoading ? "Menghubungkan..." : "Lanjutkan dengan Google"}
          </button>
        </div>

        <div className="text-center text-xs text-slate-400">
          Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi aplikasi ini.
        </div>
      </div>
    </div>
  );
}
