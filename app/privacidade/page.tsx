import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsappFloatingButton from "@/components/shared/WhatsappFloatingButton";

export const metadata: Metadata = {
  title: "Política de Privacidade | Psicóloga Grace Azevedo da Graça - OPP 25999",
  description:
    "Política de Privacidade e Tratamento de Dados Pessoais do Gabinete de Psicologia Clínica de Grace Azevedo da Graça em Ovar. Conformidade com o RGPD.",
  alternates: {
    canonical: "/privacidade",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1d2a23]">
      {/* Header Layout Component */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 bg-[#f8faf8]/50 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Navigation */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/#inicio"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#2e6f40] hover:text-[#245933] transition-colors group cursor-pointer"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span>
              <span>Voltar à Página Principal</span>
            </Link>
            <span className="text-xs font-medium text-[#5c6f64] bg-white px-3 py-1 rounded-full border border-[#d1e3d5]">
              Versão 1.0 • Setembro de 2026
            </span>
          </div>

          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-[#d1e3d5] shadow-xs p-6 sm:p-10 mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2e6f40] bg-[#f0f6f2] px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-4">
              Proteção de Dados & RGPD
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d2a23] tracking-tight">
              Política de Privacidade
            </h1>
            <p className="mt-3 text-base text-[#5c6f64] leading-relaxed">
              A privacidade, a confidencialidade e a segurança dos dados pessoais dos utentes são valores
              fundamentais no exercício da psicologia clínica. Este documento esclarece de forma transparente
              como são recolhidos, tratados e protegidos os seus dados pessoais ao utilizar o nosso website e
              formulário de marcação, em estrita conformidade com o Regulamento Geral sobre a Proteção de Dados
              (Regulamento (UE) 2016/679 — RGPD) e com as normas deontológicas aplicáveis.
            </p>
          </div>

          {/* Privacy Content Sections */}
          <div className="bg-white rounded-3xl border border-[#d1e3d5] shadow-xs p-6 sm:p-10 space-y-10 text-sm sm:text-base text-[#374151] leading-relaxed">
            {/* 1. Responsável pelo Tratamento */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#1d2a23] flex items-center gap-2.5 pb-2 border-b border-[#f0f6f2]">
                <span className="w-2 h-2 rounded-full bg-[#2e6f40]" />
                1. Responsável pelo Tratamento dos Dados
              </h2>
              <p>
                A responsável pelo tratamento dos dados pessoais recolhidos através deste website é:
              </p>
              <div className="bg-[#f8faf8] p-5 rounded-2xl border border-[#d1e3d5] text-sm text-[#1d2a23] space-y-1.5">
                <p className="font-semibold text-base text-[#1d2a23]">Grace Azevedo da Graça</p>
                <p className="text-[#5c6f64]">Psicóloga Clínica • Cédula Profissional OPP 25999</p>
                <p className="text-[#5c6f64]">
                  <strong>Gabinete:</strong> Rua de Timor, 67 – 1.º H – 3880-180 Ovar, Portugal
                </p>
                <p className="text-[#5c6f64]">
                  <strong>E-mail oficial:</strong>{" "}
                  <a href="mailto:gracepsi@hotmail.com" className="text-[#2e6f40] hover:underline font-medium">
                    gracepsi@hotmail.com
                  </a>
                </p>
                <p className="text-[#5c6f64]">
                  <strong>Telemóvel / WhatsApp:</strong>{" "}
                  <a href="tel:+351926362033" className="text-[#2e6f40] hover:underline font-medium">
                    +351 926 362 033
                  </a>
                </p>
              </div>
            </section>

            {/* 2. Dados Pessoais Recolhidos */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#1d2a23] flex items-center gap-2.5 pb-2 border-b border-[#f0f6f2]">
                <span className="w-2 h-2 rounded-full bg-[#2e6f40]" />
                2. Dados Pessoais Recolhidos
              </h2>
              <p>
                No âmbito da utilização do formulário de marcação online, são recolhidas unicamente as seguintes informações indispensáveis:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#374151]">
                <li>
                  <strong>Dados de Identificação e Contacto:</strong> Nome completo, endereço de correio eletrónico (e-mail) e número de telemóvel / WhatsApp.
                </li>
                <li>
                  <strong>Dados do Pedido de Consulta:</strong> Modalidade pretendida (Consulta Presencial no gabinete em Ovar ou Consulta Online), data e horário pretendidos.
                </li>
                <li>
                  <strong>Observações Adicionais (opcional):</strong> Informações gerais ou esclarecimentos pontuais que o utente opte voluntariamente por partilhar antes da consulta.
                </li>
              </ul>
              <div className="p-4 rounded-2xl bg-[#f0f6f2] border border-[#d1e3d5] text-xs sm:text-sm text-[#2e6f40] flex items-start gap-3 mt-3">
                <span className="text-lg shrink-0">ℹ️</span>
                <p>
                  <strong>Aviso importante:</strong> Para proteger a sua privacidade, evite indicar detalhes clínicos sensíveis neste campo durante o pedido de marcação.
                </p>
              </div>
            </section>

            {/* 3. Finalidades e Fundamento do Tratamento */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#1d2a23] flex items-center gap-2.5 pb-2 border-b border-[#f0f6f2]">
                <span className="w-2 h-2 rounded-full bg-[#2e6f40]" />
                3. Finalidades do Tratamento e Consentimento
              </h2>
              <p>
                Os seus dados pessoais destinam-se exclusivamente às seguintes finalidades legítimas:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#374151]">
                <li>Gestão, validação e registo do seu pedido de marcação de consulta;</li>
                <li>Contacto direto por e-mail e/ou WhatsApp para confirmação, esclarecimento de dúvidas ou reagendamento de horários;</li>
                <li>Envio de comunicações transacionais relativas ao estado da consulta (receção do pedido, confirmação ou cancelamento).</li>
              </ul>
              <p className="mt-2 text-sm text-[#5c6f64]">
                O tratamento assenta no <strong>consentimento explícito e voluntário</strong> manifestado pelo utente ao preencher e submeter o formulário de marcação, bem como nas diligências pré-contratuais para a prestação de serviços de saúde psicológica a pedido do titular dos dados.
              </p>
            </section>

            {/* 4. Conservação dos Dados */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#1d2a23] flex items-center gap-2.5 pb-2 border-b border-[#f0f6f2]">
                <span className="w-2 h-2 rounded-full bg-[#2e6f40]" />
                4. Conservação dos Dados Pessoais
              </h2>
              <div className="bg-[#f8faf8] p-5 rounded-2xl border border-[#d1e3d5] text-sm text-[#1d2a23] leading-relaxed">
                <p className="italic">
                  &ldquo;Os dados recolhidos através do formulário de marcação são conservados apenas durante o período necessário à gestão do pedido de marcação, à comunicação relacionada com a consulta e ao cumprimento das obrigações legais aplicáveis. Quando deixarem de ser necessários para estas finalidades, serão eliminados ou anonimizados, salvo quando exista fundamento legal que justifique a sua conservação por período adicional.&rdquo;
                </p>
              </div>
            </section>

            {/* 5. Subcontratantes e Serviços Técnicos */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#1d2a23] flex items-center gap-2.5 pb-2 border-b border-[#f0f6f2]">
                <span className="w-2 h-2 rounded-full bg-[#2e6f40]" />
                5. Serviços Técnicos de Suporte e Infraestrutura
              </h2>
              <p>
                Para assegurar a operacionalidade, segurança e resiliência técnica do website, recorremos a prestadores de serviços de tecnologia confiáveis que atuam como subcontratantes ao abrigo do RGPD:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#374151]">
                <li>
                  <strong>Supabase:</strong> Infraestrutura de base de dados em nuvem criptografada, com alojamento seguro em centros de dados certificados e proteção de acesso por políticas rigorosas de segurança (RLS - Row Level Security).
                </li>
                <li>
                  <strong>Resend:</strong> Plataforma de envio de mensagens de correio eletrónico transacional para entrega pontual das notificações de agendamento ao utente e à psicóloga.
                </li>
              </ul>
              <p className="text-xs sm:text-sm text-[#5c6f64]">
                Estes fornecedores estão vinculados por deveres de confidencialidade e segurança, tratando os dados exclusivamente segundo as instruções do responsável pelo tratamento e em conformidade com as normas europeias de proteção de dados. Os dados nunca são comercializados, partilhados ou cedidos a terceiros para efeitos de publicidade ou marketing.
              </p>
            </section>

            {/* 6. Sigilo Profissional e Deontologia */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#1d2a23] flex items-center gap-2.5 pb-2 border-b border-[#f0f6f2]">
                <span className="w-2 h-2 rounded-full bg-[#2e6f40]" />
                6. Confidencialidade e Sigilo Profissional
              </h2>
              <p>
                Enquanto profissional inscrita na Ordem dos Psicólogos Portugueses (Cédula OPP 25999), Grace Azevedo da Graça rege toda a sua prática pelo estrito cumprimento do <strong>Código Deontológico da Ordem dos Psicólogos Portugueses</strong>. O sigilo profissional abrange todas as informações clínicas, pessoais e contextuais transmitidas no âmbito da relação terapêutica.
              </p>
            </section>

            {/* 7. Direitos dos Titulares dos Dados */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#1d2a23] flex items-center gap-2.5 pb-2 border-b border-[#f0f6f2]">
                <span className="w-2 h-2 rounded-full bg-[#2e6f40]" />
                7. Direitos do Titular dos Dados
              </h2>
              <p>
                Nos termos do RGPD (Artigos 15.º a 22.º), são garantidos ao utente os seguintes direitos sobre os seus dados pessoais:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
                <div className="p-3.5 bg-[#f8faf8] rounded-xl border border-[#d1e3d5]">
                  <p className="font-bold text-[#1d2a23] mb-0.5">Direito de Acesso</p>
                  <p className="text-[#5c6f64]">Confirmar se os seus dados estão a ser tratados e aceder às informações respetivas.</p>
                </div>
                <div className="p-3.5 bg-[#f8faf8] rounded-xl border border-[#d1e3d5]">
                  <p className="font-bold text-[#1d2a23] mb-0.5">Direito de Retificação</p>
                  <p className="text-[#5c6f64]">Solicitar a correção de dados inexatos ou o completamento de dados incompletos.</p>
                </div>
                <div className="p-3.5 bg-[#f8faf8] rounded-xl border border-[#d1e3d5]">
                  <p className="font-bold text-[#1d2a23] mb-0.5">Direito ao Apagamento</p>
                  <p className="text-[#5c6f64]">Solicitar a eliminação dos seus dados quando deixem de ser necessários, salvo obrigações legais em contrário.</p>
                </div>
                <div className="p-3.5 bg-[#f8faf8] rounded-xl border border-[#d1e3d5]">
                  <p className="font-bold text-[#1d2a23] mb-0.5">Direito à Limitação e Oposição</p>
                  <p className="text-[#5c6f64]">Opor-se ao tratamento ou requerer a suspensão temporária do mesmo nos casos previstos na lei.</p>
                </div>
              </div>
              <p className="text-sm text-[#374151] pt-2">
                Para exercer qualquer um destes direitos, poderá enviar uma solicitação por escrito para o e-mail:{" "}
                <a href="mailto:gracepsi@hotmail.com" className="font-semibold text-[#2e6f40] hover:underline">
                  gracepsi@hotmail.com
                </a>.
              </p>
              <p className="text-xs text-[#5c6f64]">
                Tem igualmente o direito de apresentar uma reclamação junto da autoridade de controlo em Portugal: <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong> através de{" "}
                <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#2e6f40]">
                  www.cnpd.pt
                </a>.
              </p>
            </section>

            {/* 8. Atualizações desta Política */}
            <section className="space-y-3 pt-4 border-t border-[#f0f6f2]">
              <h2 className="text-xl font-bold text-[#1d2a23] flex items-center gap-2.5 pb-2">
                <span className="w-2 h-2 rounded-full bg-[#2e6f40]" />
                8. Alterações à Política de Privacidade
              </h2>
              <p className="text-xs sm:text-sm text-[#5c6f64]">
                A presente política pode ser revista ou atualizada periodicamente para refletir alterações legislativas, deontológicas ou funcionais. A versão em vigor e a data da respetiva atualização estarão sempre visíveis no topo desta página.
              </p>
            </section>
          </div>

          {/* Action CTA Box */}
          <div className="mt-8 text-center bg-white rounded-3xl border border-[#d1e3d5] p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-[#1d2a23]">Pretende agendar uma consulta?</h3>
            <p className="text-sm text-[#5c6f64] mt-1 mb-4">
              Escolha a modalidade presencial em Ovar ou online no nosso sistema de marcação.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#marcacao"
                className="px-6 py-2.5 bg-[#2e6f40] hover:bg-[#245933] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Ir para o Formulário de Marcação &rarr;
              </Link>
              <Link
                href="/#inicio"
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#5c6f64] hover:text-[#1d2a23] transition-colors cursor-pointer"
              >
                Página Inicial
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Layout Component */}
      <Footer />

      {/* Floating WhatsApp Action Button */}
      <WhatsappFloatingButton />
    </div>
  );
}
