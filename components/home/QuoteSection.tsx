export default function QuoteSection() {
  return (
    <section className="py-16 sm:py-20 bg-[#f0f6f2] border-y border-[#d1e3d5]/60 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Decorative Quote Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2e6f40]/10 text-[#2e6f40] mb-6">
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        {/* Sartre Quote */}
        <blockquote className="text-xl sm:text-2xl lg:text-3xl font-serif italic text-[#1d2a23] leading-relaxed max-w-3xl mx-auto">
          &ldquo;O importante não é o que fizeram de nós, mas o que fazemos daquilo que fizeram de nós.&rdquo;
        </blockquote>
        <cite className="block mt-4 text-sm sm:text-base font-semibold text-[#2e6f40] not-italic tracking-wide">
          — Jean-Paul Sartre
        </cite>

        {/* Welcoming Message - Consistent visual treatment across all three sentences */}
        <div className="mt-10 pt-8 border-t border-[#d1e3d5] max-w-2xl mx-auto space-y-3 text-sm sm:text-base text-[#1d2a23] font-normal leading-relaxed">
          <p>
            Não escolhemos as circunstâncias em que nascemos nem tudo o que nos acontece.
          </p>
          <p>
            Somos influenciados pela família, pela sociedade, pelos traumas e pelas oportunidades.
          </p>
          <p>
            Mas continuamos responsáveis pelas escolhas que fazemos a partir dessas circunstâncias.
          </p>
        </div>
      </div>
    </section>
  );
}
