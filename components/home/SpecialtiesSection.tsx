const specialties = [
  {
    id: "ansiedade",
    title: "Ansiedade",
    description:
      "Acompanhamento focado na compreensão dos mecanismos da ansiedade, gestão do stresse, ataques de pânico e inquietação persistente.",
    icon: "🌊",
  },
  {
    id: "depressao",
    title: "Depressão",
    description:
      "Intervenção terapêutica para estados depressivos, desmotivação, tristeza profunda, apatia e recuperação da vitalidade emocional.",
    icon: "🌱",
  },
  {
    id: "relacionamentos",
    title: "Relacionamentos",
    description:
      "Apoio na resolução de dificuldades relacionais, dinâmicas interpessoais, comunicação assertiva e estabelecimento de limites saudáveis.",
    icon: "🤝",
  },
  {
    id: "burnout",
    title: "Burnout",
    description:
      "Prevenção e acompanhamento do esgotamento físico e emocional associado ao contexto profissional e sobrecarga de exigências.",
    icon: "🔋",
  },
  {
    id: "autoestima",
    title: "Autoestima",
    description:
      "Desenvolvimento da autocompaixão, valorização pessoal, superação da autocrítica excessiva e fortalecimento da autoconfiança.",
    icon: "⭐",
  },
  {
    id: "phda",
    title: "PHDA",
    description:
      "Apoio no défice de atenção e hiperatividade, promovendo estratégias de autorregulação, organização e foco no quotidiano.",
    icon: "🎯",
  },
  {
    id: "autoconhecimento",
    title: "Autoconhecimento",
    description:
      "Processo de exploração pessoal, identificação de valores, clarificação de objetivos de vida e crescimento individual.",
    icon: "🧩",
  },
  {
    id: "traumas",
    title: "Traumas",
    description:
      "Processamento seguro e acolhedor de vivências dolorosas do passado, promovendo a integração emocional e a recuperação do equilíbrio.",
    icon: "🛡️",
  },
  {
    id: "terapia-casal-familia",
    title: "Terapia de Casal e Família",
    description:
      "Intervenção especializada de cariz sistémico focada nas dinâmicas de casal e nas relações familiares para superar crises e ruídos de comunicação.",
    icon: "🏡",
  },
];

export default function SpecialtiesSection() {
  return (
    <section id="especialidades" className="py-20 sm:py-28 bg-[#f8faf8] border-t border-[#d1e3d5]/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-white px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-3">
            Áreas de Intervenção
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1d2a23] tracking-tight">
            Áreas de Atuação
          </h2>
          <p className="mt-4 text-base text-[#5c6f64]">
            Acompanhamento psicológico especializado focado nas diferentes manifestações do sofrimento psíquico e no desenvolvimento pessoal.
          </p>
        </div>

        {/* 9 Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((item) => (
            <div
              key={item.id}
              className="bg-white p-7 rounded-3xl border border-[#d1e3d5] shadow-2xs hover:shadow-md hover:border-[#2e6f40] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#f0f6f2] group-hover:bg-[#2e6f40] group-hover:text-white transition-colors duration-300 flex items-center justify-center text-xl mb-5">
                  {item.icon}
                </div>

                <h3 className="text-lg font-bold text-[#1d2a23] group-hover:text-[#2e6f40] transition-colors mb-2.5">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#5c6f64] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
