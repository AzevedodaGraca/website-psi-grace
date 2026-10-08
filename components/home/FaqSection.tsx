"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "Como funciona a primeira entrevista?",
    answer:
      "A primeira entrevista é gratuita. É um espaço de acolhimento inicial que permite esclarecer dúvidas, conhecer o funcionamento do acompanhamento psicológico, compreender o motivo da consulta e avaliar em conjunto o plano mais adequado para cada utente.",
  },
  {
    question: "Onde fica localizado o gabinete?",
    answer:
      "O gabinete situa-se na Rua de Timor, 67 – 1.º H, 3880-180 Ovar, Aveiro, Portugal. Trata-se de um espaço privado, acolhedor e com facilidade de acesso no centro de Ovar.",
  },
  {
    question: "Como funcionam as consultas online?",
    answer:
      "As consultas online realizam-se à distância através de videochamada, sendo a plataforma acordada previamente com o utente (como WhatsApp, Zoom ou outra). Garantem a mesma privacidade e acompanhamento técnico de uma consulta presencial, proporcionando conveniência e flexibilidade.",
  },
  {
    question: "Quais são os públicos e faixas etárias atendidas?",
    answer:
      "A clínica presta acompanhamento psicológico a crianças (em espaço infantil próprio com recursos lúdico-pedagógicos), adolescentes, adultos, casais e famílias.",
  },
  {
    question: "Quais são os horários e dias de atendimento?",
    answer:
      "Os atendimentos decorrem de segunda a sexta-feira, sendo realizados exclusivamente por marcação prévia de horário.",
  },
  {
    question: "Quais são as formas de pagamento disponíveis?",
    answer:
      "As formas de pagamento aceites são o MB Way e a transferência bancária.",
  },
  {
    question: "Como posso marcar uma consulta ou pedir mais informações?",
    answer:
      "Pode solicitar a sua marcação utilizando os botões de contacto no site ou enviando uma mensagem no WhatsApp para o número +351 926 362 033.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-[#f0f6f2] px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-3">
            Esclarecimento de Dúvidas
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1d2a23] tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="mt-4 text-base text-[#5c6f64]">
            Respostas às questões mais comuns sobre as consultas de psicologia clínica, modalidades de atendimento e funcionamento do gabinete.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#f8faf8] rounded-2xl border border-[#d1e3d5] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-[#2e6f40] rounded-2xl"
                >
                  <span className="text-base font-bold text-[#1d2a23]">
                    {item.question}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center shrink-0 transition-transform duration-300">
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-[#5c6f64] leading-relaxed border-t border-[#f0f6f2]">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 p-8 bg-[#f0f6f2] rounded-3xl border border-[#d1e3d5] text-center max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-[#1d2a23]">
            Ainda tem dúvidas sobre as consultas?
          </h3>
          <p className="text-xs sm:text-sm text-[#5c6f64]">
            Entre em contacto direto através do WhatsApp para um atendimento rápido e esclarecedor.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="https://wa.me/351926362033?text=Ol%C3%A1%2C%20gostaria%20de%20esclarecer%20uma%20d%C3%BAvida%20sobre%20as%20consultas."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Falar no WhatsApp
            </a>

            <a
              href="#marcacao"
              className="inline-flex items-center justify-center px-5 py-3 bg-white border border-[#d1e3d5] hover:border-[#2e6f40] text-[#1d2a23] text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Marcar Consulta
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
