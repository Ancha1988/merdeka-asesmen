"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  ClipboardList, 
  FileBox, 
  Award, 
  Settings,
  School,
  Calendar,
  Users,
  GraduationCap,
  UserCircle,
  CalendarCheck,
  FileSignature,
  FileSpreadsheet
} from "lucide-react";
import { useState } from "react";

const MAIN_NAV_ITEMS_1 = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/perencanaan", label: "Perencanaan", icon: BookOpen },
  { href: "/kktp", label: "KKTP", icon: CheckSquare },
];

const ASESMEN_ITEMS = [
  { href: "/formatif", label: "Asesmen Formatif", icon: ClipboardList },
  { href: "/sumatif", label: "Asesmen Sumatif", icon: FileBox },
];

const PRESENSI_ITEMS = [
  { href: "/presensi/input", label: "Input Presensi", icon: FileSignature },
  { href: "/presensi/rekap", label: "Rekap Presensi", icon: FileSpreadsheet },
];

const MAIN_NAV_ITEMS_2 = [
  { href: "/rapor", label: "E-Rapor", icon: Award },
];

const SETTINGS_ITEMS = [
  { href: "/pengaturan/sekolah", label: "Sekolah", icon: School },
  { href: "/pengaturan/tahun-ajaran", label: "Tahun Ajaran", icon: Calendar },
  { href: "/pengaturan/kelas", label: "Kelas", icon: Users },
  { href: "/pengaturan/murid", label: "Murid", icon: GraduationCap },
  { href: "/pengaturan/guru", label: "Guru", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  
  const isSettingsActive = pathname.startsWith("/pengaturan");
  const isAsesmenActive = pathname.startsWith("/formatif") || pathname.startsWith("/sumatif");
  const isPresensiActive = pathname.startsWith("/presensi");

  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsActive);
  const [isAsesmenOpen, setIsAsesmenOpen] = useState(isAsesmenActive);
  const [isPresensiOpen, setIsPresensiOpen] = useState(isPresensiActive);

  return (
    <aside className="w-64 bg-[#0f172a] flex flex-col text-slate-400 shrink-0 h-screen break-words">
      <div className="p-6 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
          MA
        </div>
        <span className="text-white font-semibold tracking-tight">Merdeka Asesmen</span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-600">
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utama</div>
          {MAIN_NAV_ITEMS_1.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsAsesmenOpen(!isAsesmenOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium",
              isAsesmenActive || isAsesmenOpen
                ? "bg-slate-800 text-white"
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 shrink-0" />
              <span>Asesmen</span>
            </div>
            <span className="text-xs text-slate-500">{isAsesmenOpen ? '▼' : '►'}</span>
          </button>

          {(isAsesmenOpen || isAsesmenActive) && (
            <div className="mt-1 pl-3 space-y-1">
              {ASESMEN_ITEMS.map((subitem) => {
                const isSubActive = pathname === subitem.href || pathname.startsWith(subitem.href);
                return (
                  <Link
                    key={subitem.href}
                    href={subitem.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors text-sm",
                      isSubActive 
                        ? "text-blue-400 font-medium" 
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <subitem.icon className="w-4 h-4 shrink-0" />
                    <span>{subitem.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {MAIN_NAV_ITEMS_2.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsPresensiOpen(!isPresensiOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium",
              isPresensiActive || isPresensiOpen
                ? "bg-slate-800 text-white"
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-5 h-5 shrink-0" />
              <span>Presensi</span>
            </div>
            <span className="text-xs text-slate-500">{isPresensiOpen ? '▼' : '►'}</span>
          </button>

          {(isPresensiOpen || isPresensiActive) && (
            <div className="mt-1 pl-3 space-y-1">
              {PRESENSI_ITEMS.map((subitem) => {
                const isSubActive = pathname === subitem.href || pathname.startsWith(subitem.href);
                return (
                  <Link
                    key={subitem.href}
                    href={subitem.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors text-sm",
                      isSubActive 
                        ? "text-blue-400 font-medium" 
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <subitem.icon className="w-4 h-4 shrink-0" />
                    <span>{subitem.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengaturan</div>
          
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium",
              isSettingsActive || isSettingsOpen
                ? "bg-slate-800 text-white"
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 shrink-0" />
              <span>Pengaturan</span>
            </div>
            <span className="text-xs text-slate-500">{isSettingsOpen ? '▼' : '►'}</span>
          </button>

          {(isSettingsOpen || isSettingsActive) && (
            <div className="mt-1 pl-3 space-y-1">
              {SETTINGS_ITEMS.map((subitem) => {
                const isSubActive = pathname === subitem.href || pathname.startsWith(subitem.href);
                return (
                  <Link
                    key={subitem.href}
                    href={subitem.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors text-sm",
                      isSubActive 
                        ? "text-blue-400 font-medium" 
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <subitem.icon className="w-4 h-4 shrink-0" />
                    <span>{subitem.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
             <UserCircle className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm text-white truncate">Bpk. Budi</p>
            <p className="text-xs text-slate-500">Guru Kelas 5</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
