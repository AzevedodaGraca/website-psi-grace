import Image from "next/image";
import Link from "next/link";

export default function LocationContactSection() {
  const mapEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3019.123!2d-8.6253!3d40.8586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2385a4a5814523%3A0x6b772b83a0026e69!2sRua%20de%20Timor%2067%2C%203880-180%20Ovar%2C%20Portugal!5e0!3m2!1spt-PT!2spt!4v1700000000000!5m2!1spt-PT!2spt";

  const googleMapsDirectionsUrl =
    "https://www.google.com/maps/search/?api=1&query=Rua+de+Timor+67+Ovar+Portugal";

  return (
    <section id="contacto" className="py-20 sm:py-28 bg-[#f8faf8] border-t border-[#d1e3d5]/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-white px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-3">
            Onde Estamos & Contactos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1d2a23] tracking-tight">
            Localização e Contacto
          </h2>
          <p className="mt-4 text-base text-[#5c6f64]">
            Encontre todas as informações necessárias para chegar ao gabinete em Ovar ou entrar em contacto direto para esclarecimentos e marcação de consultas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Facade Photo & Contact Details */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Facade Photo Box */}
            <div className="relative w-full aspect-16/10 rounded-3xl overflow-hidden shadow-lg border border-[#d1e3d5] bg-white group">
              <Image
                src="/assets/clinic/Fachada.jpg"
                alt="Fachada do Gabinete de Psicologia Grace Azevedo da Graça em Ovar"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#2e6f40] text-white mb-1.5">
                  OPP 25999
                </span>
                <h3 className="text-base sm:text-lg font-bold">
                  Grace Azevedo da Graça — Psicóloga Clínica
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Placa Identificativa Externa • Rua de Timor, 67 – 1.º H, Ovar
                </p>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d1e3d5] shadow-xs flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#5c6f64]">Endereço do Gabinete</h4>
                    <p className="text-base font-semibold text-[#1d2a23] mt-0.5">
                      Rua de Timor, 67 – 1.º H
                    </p>
                    <p className="text-sm text-[#5c6f64]">
                      3880-180 Ovar, Aveiro, Portugal
                    </p>
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#5c6f64]">Telemóvel & WhatsApp</h4>
                    <a
                      href="https://wa.me/351926362033?text=Ol%C3%A1%2C%20gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20as%20consultas."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-[#1d2a23] hover:text-[#2e6f40] transition-colors mt-0.5 block"
                    >
                      +351 926 362 033
                    </a>
                    <p className="text-xs text-[#5c6f64]">Contacto telefónico e mensagens WhatsApp</p>
                  </div>
                </div>

                {/* Email & Instagram */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#5c6f64] uppercase block">E-mail</span>
                      <a href="mailto:gracepsi@hotmail.com" className="text-xs font-semibold text-[#1d2a23] hover:text-[#2e6f40]">
                        gracepsi@hotmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#f0f6f2] text-[#2e6f40] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#5c6f64] uppercase block">Instagram</span>
                      <a href="https://instagram.com/grcpsi" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#1d2a23] hover:text-[#2e6f40]">
                        @grcpsi
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 border-t border-[#f0f6f2] flex flex-col sm:flex-row gap-3">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#f0f6f2] hover:bg-[#d1e3d5] text-[#2e6f40] text-xs font-semibold rounded-xl transition-colors text-center"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Obter Direções
                </a>

                <Link
                  href="#marcacao"
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-[#2e6f40] hover:bg-[#245933] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors text-center"
                >
                  Marcar Consulta
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Google Maps Embed Card */}
          <div className="lg:col-span-6 flex flex-col bg-white rounded-3xl border border-[#d1e3d5] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#f0f6f2] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1d2a23]">
                  Mapa de Localização
                </h3>
                <p className="text-xs text-[#5c6f64]">
                  Consultório na Rua de Timor, 67 – 1.º H, Ovar
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#f0f6f2] text-[#2e6f40] text-xs font-semibold rounded-lg">
                Ovar • Aveiro
              </span>
            </div>

            {/* Google Maps Responsive Frame */}
            <div className="relative flex-1 min-h-[340px] sm:min-h-[400px] w-full bg-zinc-100">
              <iframe
                title="Mapa do Gabinete de Psicologia Grace Azevedo da Graça em Ovar"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>

            <div className="p-4 bg-[#f8faf8] border-t border-[#f0f6f2] text-xs text-[#5c6f64] flex items-center justify-between">
              <span>📅 Segunda a Sexta (Por marcação)</span>
              <span>💳 MB Way & Transferência</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
