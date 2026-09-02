"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("E-mail ou palavra-passe incorretos.");
        } else {
          setErrorMessage("Falha na autenticação. Verifique as suas credenciais.");
        }
        setIsLoading(false);
        return;
      }

      // Successful login -> redirect to protected /admin
      router.push("/admin");
      router.refresh();
    } catch {
      setErrorMessage("Ocorreu um erro ao ligar ao serviço de autenticação.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Clinic Logo */}
        <Link href="/" className="inline-flex flex-col items-center group mb-6">
          <div className="relative w-12 h-12 mb-2">
            <Image
              src="/assets/branding/arvore.png"
              alt="Logo Psicóloga Grace Azevedo da Graça"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-base font-bold text-[#1d2a23]">
            Grace Azevedo da Graça
          </span>
          <span className="text-xs text-[#2e6f40] font-medium">
            Psicóloga Clínica • OPP 25999
          </span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-[#1d2a23]">
          Área Administrativa
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#5c6f64]">
          Acesso exclusivo para gestão do gabinete de psicologia em Ovar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-[#d1e3d5] sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Error Notification */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-red-500 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="exemplo@grcpsi.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#d1e3d5] bg-[#f8faf8] text-sm text-[#1d2a23] focus:outline-none focus:ring-2 focus:ring-[#2e6f40] transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#1d2a23] mb-2"
              >
                Palavra-passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#d1e3d5] bg-[#f8faf8] text-sm text-[#1d2a23] focus:outline-none focus:ring-2 focus:ring-[#2e6f40] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-[#2e6f40] hover:bg-[#245933] active:bg-[#1d4628] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2e6f40] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>A autenticar...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </div>
          </form>

          {/* Return to website link */}
          <div className="mt-6 text-center pt-4 border-t border-[#f0f6f2]">
            <Link
              href="/"
              className="text-xs font-semibold text-[#5c6f64] hover:text-[#2e6f40] transition-colors"
            >
              &larr; Voltar ao site principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
