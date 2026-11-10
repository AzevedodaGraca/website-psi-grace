import Link from "next/link";

export default function ServicesSection() {
  return (
    <section id="servicos" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-[#f0f6f2] px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-3">
            Acompanhamento Adaptado
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1d2a23] tracking-tight">
            Tipos de Atendimento
          </h2>
          <p className="mt-4 text-base text-[#5c6f64]">
            Consultas presenciais no gabinete em Ovar e consultas online, preparadas para responder às necessidades específicas de toda a gente, em cada fase da vida.
          </p>
        </div>

        {/* Feature Callout - Primeira Entrevista Gratuita */}
        <div className="mb-16 bg-gradient-to-r from-[#2e6f40] to-[#245933] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
              ✨ Acolhimento Inicial
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Primeira Entrevista Gratuita
            </h3>
            <p className="text-sm sm:text-base text-emerald-100 max-w-xl">
              Um primeiro contacto sem compromisso para esclarecer dúvidas, conhecer o espaço e avaliar o plano de acompanhamento mais adequado.
            </p>
          </div>

          <Link
            href="#marcacao"
            className="shrink-0 px-6 py-3.5 bg-white text-[#2e6f40] hover:bg-emerald-50 text-sm font-semibold rounded-xl shadow-md transition-colors text-center w-full md:w-auto"
          >
            Marcar Primeira Entrevista
          </Link>
        </div>

        {/* Modalities: Presencial vs Online */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#f8faf8] p-8 rounded-3xl border border-[#d1e3d5] flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2e6f40] uppercase tracking-wider mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2e6f40]" />
                Atendimento Presencial
              </div>
              <h3 className="text-xl font-bold text-[#1d2a23] mb-3">
                Gabinete em Ovar
              </h3>
              <p className="text-sm text-[#5c6f64] leading-relaxed">
                Consultas realizadas presencialmente num ambiente acolhedor, privado e tranquilo no gabinete em Ovar (Aveiro), dotado de espaço próprio para atendimento de adultos, famílias e de um espaço dedicado ao público infantil.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d1e3d5] text-xs text-[#1d2a23] font-medium">
              📍 Rua de Timor, 67 – 1º H, 3880-180 Ovar
            </div>
          </div>

          <div className="bg-[#f8faf8] p-8 rounded-3xl border border-[#d1e3d5] flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#25D366] uppercase tracking-wider mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
                Atendimento Online
              </div>
              <h3 className="text-xl font-bold text-[#1d2a23] mb-3">
                Consulta Online
              </h3>
              <p className="text-sm text-[#5c6f64] leading-relaxed">
                Acompanhamento psicológico à distância realizado por videochamada, garantindo flexibilidade, conforto e acessibilidade sem necessidade de deslocação.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d1e3d5] text-xs text-[#1d2a23] font-medium">
              💻 Videochamada
            </div>
          </div>
        </div>

        {/* Target Audiences Grid */}
        <h3 className="text-xl font-bold text-[#1d2a23] text-center mb-8">
          Públicos Atendidos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Infantil */}
          <div className="p-6 bg-white rounded-2xl border border-[#d1e3d5] shadow-2xs hover:border-[#2e6f40] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center font-bold mb-4">
              🧸
            </div>
            <h4 className="text-lg font-bold text-[#1d2a23] mb-2">
              Atendimento Infantil
            </h4>
            <p className="text-xs sm:text-sm text-[#5c6f64] leading-relaxed">
              Acompanhamento lúdico e terapêutico adaptado às crianças, contando com materiais específicos e técnicas pedagógico-emocionais.
            </p>
          </div>

          {/* Card: Adolescentes */}
          <div className="p-6 bg-white rounded-2xl border border-[#d1e3d5] shadow-2xs hover:border-[#2e6f40] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center font-bold mb-4">
              🌱
            </div>
            <h4 className="text-lg font-bold text-[#1d2a23] mb-2">
              Atendimento para Adolescentes
            </h4>
            <p className="text-xs sm:text-sm text-[#5c6f64] leading-relaxed">
              Apoio nas fases de transição, gestão de emoções, autoestima, desafios escolares, relacionais e de identidade.
            </p>
          </div>

          {/* Card: Adultos */}
          <div className="p-6 bg-white rounded-2xl border border-[#d1e3d5] shadow-2xs hover:border-[#2e6f40] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center font-bold mb-4">
              👤
            </div>
            <h4 className="text-lg font-bold text-[#1d2a23] mb-2">
              Atendimento para Adultos
            </h4>
            <p className="text-xs sm:text-sm text-[#5c6f64] leading-relaxed">
              Intervenção focada no autoconhecimento, gestão da ansiedade, depressão, burnout, stresse profissional e momentos de crise.
            </p>
          </div>

          {/* Card: Casais */}
          <div className="p-6 bg-white rounded-2xl border border-[#d1e3d5] shadow-2xs hover:border-[#2e6f40] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center font-bold mb-4">
              👥
            </div>
            <h4 className="text-lg font-bold text-[#1d2a23] mb-2">
              Atendimento para Casais
            </h4>
            <p className="text-xs sm:text-sm text-[#5c6f64] leading-relaxed">
              Terapia de casal direcionada para a melhoria da comunicação, resolução de conflitos e fortalecimento da dinâmica relacional.
            </p>
          </div>

          {/* Card: Famílias */}
          <div className="p-6 bg-white rounded-2xl border border-[#d1e3d5] shadow-2xs hover:border-[#2e6f40] transition-colors sm:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center font-bold mb-4">
              🏡
            </div>
            <h4 className="text-lg font-bold text-[#1d2a23] mb-2">
              Atendimento para Famílias
            </h4>
            <p className="text-xs sm:text-sm text-[#5c6f64] leading-relaxed">
              Intervenção sistémica orientada para harmonizar a convivência familiar, promover a compreensão mútua e superar fases de mudança.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
