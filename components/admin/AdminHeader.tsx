"use client";

import Link from "next/link";
import Image from "next/image";

interface AdminHeaderProps {
  userEmail?: string | null;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export default function AdminHeader({
  userEmail,
  onLogout,
  isLoggingOut = false,
}: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-[#d1e3d5] sticky top-0 z-30 shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <Link href="/" className="relative w-8 h-8 shrink-0">
            <Image
              src="/assets/branding/arvore.png"
              alt="Logo Psicóloga Grace Azevedo da Graça"
              fill
              className="object-contain"
            />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-[#1d2a23]">
              Painel Administrativo
            </h1>
            <p className="text-[11px] font-medium text-[#2e6f40]">
              Grace Azevedo da Graça — Psicóloga Clínica (OPP 25999)
            </p>
          </div>
        </div>

        {/* Right: User Email, Link to Public Site & Logout Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="hidden md:inline-flex text-xs font-semibold text-[#5c6f64] hover:text-[#2e6f40] transition-colors"
          >
            &larr; Ver site público
          </Link>

          {userEmail && (
            <div className="hidden sm:block text-right text-xs">
              <span className="block font-semibold text-[#1d2a23]">
                Sessão Ativa
              </span>
              <span className="block text-[#5c6f64] text-[11px]">
                {userEmail}
              </span>
            </div>
          )}

          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="px-3.5 py-2 text-xs font-semibold text-[#2e6f40] bg-[#f0f6f2] hover:bg-[#2e6f40] hover:text-white border border-[#d1e3d5] rounded-xl transition-colors shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? "A terminar..." : "Terminar sessão"}
          </button>
        </div>
      </div>
    </header>
  );
}
