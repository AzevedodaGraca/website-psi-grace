import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f8faf8] via-white to-white py-16 sm:py-24 lg:py-28">
      {/* Background subtle tree watermark */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 opacity-5 pointer-events-none">
        <Image
          src="/assets/branding/arvore.png"
          alt=""
          width={700}
          height={700}
          aria-hidden="true"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column - Main Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* OPP Credential Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#f0f6f2] text-[#2e6f40] border border-[#d1e3d5] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#2e6f40] animate-pulse" />
              Psicóloga Clínica • OPP 25999 • Ovar
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1d2a23] leading-[1.15]">
              Cuidado psicológico com{" "}
              <span className="text-[#2e6f40] underline decoration-[#d1e3d5] underline-offset-4">
                empatia
              </span>{" "}
              e{" "}
              <span className="text-[#2e6f40] underline decoration-[#d1e3d5] underline-offset-4">
                acolhimento
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#5c6f64] leading-relaxed max-w-2xl">
              Acompanhamento psicológico presencial e online, promovendo a saúde psíquica e o bem-estar emocional para toda a gente — crianças, jovens, adultos, casais e famílias.
            </p>

            {/* Quick Benefits Tags */}
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-[#1d2a23]">
              <span className="inline-flex items-center px-3 py-1 bg-white border border-[#d1e3d5] rounded-lg shadow-2xs">
                ✨ Primeira entrevista gratuita
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white border border-[#d1e3d5] rounded-lg shadow-2xs">
                📍 Gabinete em Ovar
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white border border-[#d1e3d5] rounded-lg shadow-2xs">
                💬 Consultas Online
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="#marcacao"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-[#2e6f40] hover:bg-[#245933] active:bg-[#1d4628] rounded-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2e6f40] focus:ring-offset-2 text-center"
              >
                Marcar Consulta
              </Link>

              <a
                href="https://wa.me/351926362033?text=Ol%C3%A1%2C%20gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20as%20consultas."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-[#1d2a23] bg-white border border-[#d1e3d5] hover:border-[#2e6f40] hover:text-[#2e6f40] rounded-xl shadow-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2e6f40] text-center"
              >
                <svg
                  className="w-4 h-4 fill-[#25D366]"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          </div>

          {/* Right Column - Official Branding Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-[#d1e3d5] shadow-xl text-center">
              <div className="relative w-full aspect-4/3 mb-6 overflow-hidden rounded-2xl bg-[#f0f6f2] flex items-center justify-center p-4">
                <Image
                  src="/assets/branding/base com arvore.png"
                  alt="Identidade Visual Grace Azevedo da Graça"
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>

              <h2 className="text-xl font-bold text-[#1d2a23]">
                Grace Azevedo da Graça
              </h2>
              <p className="text-sm font-medium text-[#2e6f40] mt-0.5">
                Psicóloga Clínica • OPP 25999
              </p>

              <div className="mt-4 pt-4 border-t border-[#f0f6f2] text-xs text-[#5c6f64] flex justify-between items-center px-2">
                <span>📍 Gabinete em Ovar</span>
                <span>🎓 EuroPsy</span>
                <span>⭐ +10 Anos Exp.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
