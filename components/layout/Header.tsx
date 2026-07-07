"use client";

import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { auth } from "@/lib/firebase";
import { Bell, LogOut, User as UserIcon } from "lucide-react";
import { FirebaseSync } from "../shared/FirebaseSync";
import { useRouter } from "next/navigation";

export function Header() {
  const { tahunAjaranAktif } = useAppStore();
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800 hidden lg:block">
          Sistem Asesmen Kurikulum Merdeka
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {tahunAjaranAktif ? (
          <div className="hidden md:flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            TA: {tahunAjaranAktif.tahun} - SMT {tahunAjaranAktif.semester}
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            Set Tahun Ajaran!
          </div>
        )}
        
        <FirebaseSync />

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-700">{user.displayName || user.email}</span>
              <span className="text-xs text-slate-500">{isAdmin ? "Administrator" : "Guru"}</span>
            </div>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <UserIcon className="w-4 h-4 text-slate-500" />
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors ml-1"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
