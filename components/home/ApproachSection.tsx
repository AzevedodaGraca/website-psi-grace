export default function ApproachSection() {
  return (
    <section id="abordagem" className="py-20 sm:py-28 bg-[#f8faf8] border-t border-[#d1e3d5]/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-white px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-3">
            Enquadramento Clínico
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1d2a23] tracking-tight">
            Abordagem Terapêutica
          </h2>
          <p className="mt-4 text-base text-[#5c6f64]">
            Prática fundamentada no rigor científico e na compreensão integral da pessoa, das suas relações e do seu contexto de vida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Abordagem Sistêmica */}
          <div className="bg-white p-8 rounded-3xl border border-[#d1e3d5] shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-[#1d2a23] mb-3">
                Abordagem Sistémica
              </h3>

              <p className="text-sm text-[#5c6f64] leading-relaxed">
                Compreende o indivíduo inserido nos seus sistemas relacionais, familiares e sociais. Permite identificar padrões de comunicação, dinâmicas de relacionamento e fatores de contexto que influenciam o bem-estar psicológico e a saúde familiar.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f0f6f2]">
              <span className="text-xs font-semibold text-[#2e6f40]">
                Especialização Grão (2016) • Terapia Familiar e de Casal
              </span>
            </div>
          </div>

          {/* Card 2: Terapia Cognitivo-Comportamental (TCC) */}
          <div className="bg-white p-8 rounded-3xl border border-[#d1e3d5] shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#faf5f0] text-[#7a5230] flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-[#1d2a23] mb-3">
                Terapia Cognitivo-Comportamental (TCC)
              </h3>

              <p className="text-sm text-[#5c6f64] leading-relaxed">
                Foca-se na relação entre pensamentos, emoções e comportamentos. Oferece ferramentas estruturadas para desenvolver estratégias de resposta saudáveis perante desafios como a ansiedade, a depressão, o stresse e os padrões comportamentais.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#faf5f0]">
              <span className="text-xs font-semibold text-[#7a5230]">
                Foco no Desenvolvimento de Estratégias Práticas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
