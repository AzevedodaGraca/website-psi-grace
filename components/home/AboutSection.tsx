import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="sobre" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-[#f0f6f2] px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-3">
            Perfil Profissional
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1d2a23] tracking-tight">
            Sobre a Dra. Grace Azevedo da Graça
          </h2>
          <p className="mt-4 text-base text-[#5c6f64]">
            Psicóloga Clínica registada na Ordem dos Psicólogos Portugueses (OPP 25999) com certificação EuroPsy e mais de 10 anos de experiência clínica.
          </p>
        </div>

        {/* 12-column Grid: Photo takes 4 cols (33.3%), Info takes 8 cols (66.7%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column - Real Photo & Badges (~33% desktop width) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start mx-auto lg:mx-0 w-full max-w-xs">
            <div className="relative w-full aspect-4/5 rounded-3xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-[#d1e3d5]">
              <Image
                src="/assets/grace/grace.jpeg"
                alt="Fotografia profissional de Grace Azevedo da Graça"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
                priority
              />
            </div>

            {/* Badges Grid */}
            <div className="w-full grid grid-cols-2 gap-3 mt-5">
              <div className="p-3.5 bg-[#f8faf8] rounded-2xl border border-[#d1e3d5] text-center">
                <span className="block text-base font-bold text-[#2e6f40]">OPP 25999</span>
                <span className="text-[11px] text-[#5c6f64]">Ordem Psicólogos</span>
              </div>

              <div className="p-3.5 bg-[#f8faf8] rounded-2xl border border-[#d1e3d5] text-center">
                <span className="block text-base font-bold text-[#2e6f40]">EuroPsy</span>
                <span className="text-[11px] text-[#5c6f64]">Certificação Europeia</span>
              </div>
            </div>
          </div>

          {/* Right Column - Biography, Education, Mission & Values (~67% desktop width) */}
          <div className="lg:col-span-8 space-y-8 text-[#1d2a23]">
            {/* Biography */}
            <div className="bg-[#f8faf8] p-6 sm:p-8 rounded-3xl border border-[#d1e3d5]">
              <h3 className="text-xl font-bold text-[#1d2a23] mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2e6f40]" />
                Apresentação Profissional
              </h3>
              <p className="text-base text-[#5c6f64] leading-relaxed">
                Graduada em psicologia pela Universidade Estácio de Sá em 2015, com especialização em Terapia Familiar e de Casal, abordagem Sistémica no curso Grão em 2016. Registada na Ordem dos Psicólogos Portugueses e com certificação Europsy. Desde graduada atua em gabinete particular, primeiro no Brasil e atualmente em Portugal, fazendo acompanhamento psicológico dos utentes, promovendo a saúde psíquica e comportamental do indivíduo.
              </p>
            </div>

            {/* Formação Académica e Certificações */}
            <div>
              <h3 className="text-lg font-bold text-[#1d2a23] mb-4">
                Formação Académica e Certificações
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-[#5c6f64]">
                  <span className="w-2 h-2 rounded-full bg-[#2e6f40] mt-2 shrink-0" />
                  <span>
                    <strong className="text-[#1d2a23]">Graduação em Psicologia</strong> — Universidade Estácio de Sá (2015)
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#5c6f64]">
                  <span className="w-2 h-2 rounded-full bg-[#2e6f40] mt-2 shrink-0" />
                  <span>
                    <strong className="text-[#1d2a23]">Especialização em Terapia Familiar e de Casal (Abordagem Sistémica)</strong> — Grão - Cursos e Serviços em Psicologia (2016)
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#5c6f64]">
                  <span className="w-2 h-2 rounded-full bg-[#2e6f40] mt-2 shrink-0" />
                  <span>
                    <strong className="text-[#1d2a23]">Introdução à Caixa de Areia</strong> — Grão - Cursos e Serviços em Psicologia
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#5c6f64]">
                  <span className="w-2 h-2 rounded-full bg-[#2e6f40] mt-2 shrink-0" />
                  <span>
                    <strong className="text-[#1d2a23]">Registo na Ordem dos Psicólogos Portugueses & Certificação EuroPsy</strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* Mission & Values Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#f0f6f2] border border-[#d1e3d5]">
                <h4 className="text-sm font-bold text-[#2e6f40] uppercase tracking-wider mb-2">
                  Missão da Clínica
                </h4>
                <p className="text-sm text-[#1d2a23] font-medium leading-snug">
                  &ldquo;Promover a saúde psíquica e comportamental do indivíduo.&rdquo;
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf5f0] border border-[#7a5230]/20">
                <h4 className="text-sm font-bold text-[#7a5230] uppercase tracking-wider mb-2">
                  Valores Profissionais
                </h4>
                <p className="text-xs text-[#1d2a23] leading-relaxed">
                  &ldquo;Cumprir os princípios de conduta profissional estabelecidos na meta-ética, utilizando o conhecimento científico necessário e as competências profissionais.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
