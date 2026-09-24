import Link from "next/link";
import TreeLogo from "../shared/TreeLogo";

export default function Footer() {
  return (
    <footer className="bg-[#1d2a23] text-white pt-16 pb-12 border-t border-[#2e6f40]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Mission */}
          <div className="flex flex-col gap-4">
            <TreeLogo size={44} className="[&_span]:text-white [&_span.text-xs]:text-emerald-200/80" />
            <p className="text-sm text-emerald-100/80 leading-relaxed mt-2">
              Promover a saúde psíquica e comportamental do indivíduo através de uma prática clínica ética, científica e acolhedora.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#2e6f40]/40 text-emerald-200 border border-[#2e6f40]/50">
                OPP 25999
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#2e6f40]/40 text-emerald-200 border border-[#2e6f40]/50">
                Certificação EuroPsy
              </span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Navegação
            </h3>
            <ul className="space-y-2.5 text-sm text-emerald-100/80">
              <li>
                <Link href="#inicio" className="hover:text-emerald-300 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="#sobre" className="hover:text-emerald-300 transition-colors">
                  Sobre a Dra. Grace
                </Link>
              </li>
              <li>
                <Link href="#abordagem" className="hover:text-emerald-300 transition-colors">
                  Abordagem Terapêutica
                </Link>
              </li>
              <li>
                <Link href="#servicos" className="hover:text-emerald-300 transition-colors">
                  Tipos de Atendimento
                </Link>
              </li>
              <li>
                <Link href="#especialidades" className="hover:text-emerald-300 transition-colors">
                  Especialidades
                </Link>
              </li>
              <li>
                <Link href="#gabinete" className="hover:text-emerald-300 transition-colors">
                  O Gabinete
                </Link>
              </li>
              <li>
                <Link href="#marcacao" className="hover:text-emerald-300 transition-colors">
                  Marcações
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-emerald-300 transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Location */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Gabinete & Contacto
            </h3>
            <ul className="space-y-3 text-sm text-emerald-100/80">
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  Rua de Timor, 67 – 1º H<br />
                  3880-180 Ovar, Aveiro, Portugal
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+351926362033" className="hover:text-emerald-300 transition-colors">
                  +351 926 362 033 (Telemóvel / WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:gracepsi@hotmail.com" className="hover:text-emerald-300 transition-colors">
                  gracepsi@hotmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <a href="https://instagram.com/grcpsi" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors">
                  @grcpsi
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Hours & Payments */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Atendimento & Pagamento
            </h3>
            <div className="space-y-4 text-sm text-emerald-100/80">
              <div>
                <p className="font-medium text-white mb-1">Horário de Atendimento:</p>
                <p>Segunda a Sexta-feira</p>
                <p className="text-xs text-emerald-300/90 mt-0.5">Atendimento por marcação</p>
              </div>

              <div>
                <p className="font-medium text-white mb-1">Modalidades:</p>
                <p>Presencial (Ovar) & Online</p>
                <p className="text-xs text-emerald-300 font-semibold mt-1">
                  • Primeira entrevista gratuita
                </p>
              </div>

              <div>
                <p className="font-medium text-white mb-1">Pagamento:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-white/10 rounded-md text-emerald-200">MB Way</span>
                  <span className="px-2 py-1 bg-white/10 rounded-md text-emerald-200">Transferência Bancária</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60">
          <p>© {new Date().getFullYear()} Grace Azevedo da Graça. Todos os direitos reservados.</p>
          <p>Psicóloga Clínica • Ordem dos Psicólogos Portugueses: OPP 25999</p>
        </div>
      </div>
    </footer>
  );
}
