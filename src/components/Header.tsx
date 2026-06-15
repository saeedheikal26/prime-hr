import React from "react";
import { Briefcase, ShieldCheck, Lock, User } from "lucide-react";

interface HeaderProps {
  isAdminMode: boolean;
  onToggleAdmin: () => void;
  onLogout: () => void;
}

export default function Header({ isAdminMode, onToggleAdmin, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#002B5B]/95 backdrop-blur-md border-b-4 border-[#C5A059] shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Company Name */}
          <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => { if (isAdminMode) { onToggleAdmin(); } }}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#002B5B] to-[#01142a] border border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.25)]">
              <span className="text-white font-black text-xl select-none">P</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-[#002B5B]" />
            </div>
            <div>
              
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span className="text-white font-medium text-lg text-opacity-95">HR Solutions</span>
                <span className="text-[#C5A059]">Prime</span>
              </h1>
              <p className="text-[11px] text-gray-300 font-medium text-left sm:text-right">
                خدمات التوظيف والموارد البشرية
              </p>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-3">
            {isAdminMode ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block bg-emerald-950 text-emerald-400 border border-emerald-850/30 text-xs px-3 py-1.5 rounded-full font-medium">
                  ● وضع المسؤول (نشط)
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/30 text-red-200 hover:text-white rounded-xl text-sm transition-all duration-200"
                  title="تسجيل الخروج من لوحة التحكم"
                  id="btn-admin-logout"
                >
                  <Lock className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onToggleAdmin}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] text-white hover:bg-[#b08d48] rounded-full text-xs font-bold transition-all duration-300 shadow-md transform active:scale-95"
                title="لوحة تحكم الموظفين"
                id="btn-admin-login"
              >
                <Lock className="w-4 h-4" />
                <span>لوحة التحكم</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
