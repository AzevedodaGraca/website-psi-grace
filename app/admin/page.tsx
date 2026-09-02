"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkUserSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      setUser(user);
      setIsLoading(false);
    }

    checkUserSession();
  }, [router]);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#2e6f40] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#5c6f64]">
            A verificar sessão administrativa...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col font-sans">
      {/* Admin Top Navigation Header */}
      <header className="bg-white border-b border-[#d1e3d5] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right text-xs">
              <span className="block font-semibold text-[#1d2a23]">
                Sessão Ativa
              </span>
              <span className="block text-[#5c6f64] text-[11px]">
                {user?.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 text-xs font-semibold text-[#2e6f40] bg-[#f0f6f2] hover:bg-[#2e6f40] hover:text-white border border-[#d1e3d5] rounded-xl transition-colors shadow-2xs"
            >
              Terminar sessão
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-3xl border border-[#d1e3d5] shadow-lg p-6 sm:p-10 space-y-6">
          <div className="border-b border-[#f0f6f2] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-[#f0f6f2] px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-2">
                Sessão Confirmada
              </span>
              <h2 className="text-2xl font-bold text-[#1d2a23]">
                Painel Administrativo
              </h2>
              <p className="text-sm font-semibold text-[#2e6f40] mt-1">
                Autenticação realizada com sucesso.
              </p>
            </div>

            <div className="text-xs text-[#5c6f64] bg-[#f8faf8] p-3 rounded-2xl border border-[#d1e3d5] shrink-0">
              <span className="block font-bold text-[#1d2a23]">Sessão de Administrador</span>
              <span className="block text-[11px]">{user?.email}</span>
            </div>
          </div>

          {/* Verification Box */}
          <div className="bg-[#f8faf8] p-6 rounded-2xl border border-[#d1e3d5] space-y-3">
            <h3 className="text-base font-bold text-[#1d2a23]">
              Área de gestão da clínica.
            </h3>
            <p className="text-xs sm:text-sm text-[#5c6f64] leading-relaxed">
              Esta área protegida serve como base de autenticação para a gestão do gabinete em Ovar. Nas próximas fases do projeto, esta interface integrará a gestão de disponibilidade do calendário e a visualização de marcações de consultas presenciais e online.
            </p>
          </div>

          {/* Quick Actions / Security Note */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5c6f64]">
            <Link
              href="/"
              className="text-[#2e6f40] hover:underline font-semibold"
            >
              &larr; Ver site público
            </Link>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#1d2a23] hover:bg-[#2e6f40] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
            >
              Terminar sessão
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
