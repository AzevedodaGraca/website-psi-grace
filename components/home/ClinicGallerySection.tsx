"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: "gabinete" | "infantil" | "espera";
  categoryLabel: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: "fachada",
    src: "/assets/clinic/Fachada.jpg",
    title: "Fachada Externa & Placa do Gabinete",
    category: "gabinete",
    categoryLabel: "Gabinete",
  },
  {
    id: "visao-geral",
    src: "/assets/clinic/consultorio-visao-geral.jpeg",
    title: "Visão Geral do Gabinete de Consulta",
    category: "gabinete",
    categoryLabel: "Gabinete",
  },
  {
    id: "espaco-consultorio",
    src: "/assets/clinic/espaco-consultorio.jpeg",
    title: "Espaço de Acompanhamento Psicológico",
    category: "gabinete",
    categoryLabel: "Gabinete",
  },
  {
    id: "sala-de-espera",
    src: "/assets/clinic/sala-de-espera.jpeg",
    title: "Sala de Espera",
    category: "espera",
    categoryLabel: "Recepção & Espera",
  },
  {
    id: "porta-consultorio",
    src: "/assets/clinic/porta-consultorio.jpeg",
    title: "Entrada do Gabinete",
    category: "espera",
    categoryLabel: "Recepção & Espera",
  },
  {
    id: "espaco-infantil",
    src: "/assets/clinic/espaco-infantil.jpeg",
    title: "Espaço de Psicologia Infantil",
    category: "infantil",
    categoryLabel: "Espaço Infantil",
  },
  {
    id: "sala-infantil",
    src: "/assets/clinic/sala-infantil.jpeg",
    title: "Área Lúdico-Terapêutica Infantil",
    category: "infantil",
    categoryLabel: "Espaço Infantil",
  },
  {
    id: "brinquedos",
    src: "/assets/clinic/brinquedos.jpeg",
    title: "Materiais Pedagógicos e Terapêuticos",
    category: "infantil",
    categoryLabel: "Espaço Infantil",
  },
];

export default function ClinicGallerySection() {
  const [activeFilter, setActiveFilter] = useState<string>("todas");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems =
    activeFilter === "todas"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);

  return (
    <section id="gabinete" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2e6f40] bg-[#f0f6f2] px-3.5 py-1 rounded-full border border-[#d1e3d5] mb-3">
            Espaço Físico em Ovar
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1d2a23] tracking-tight">
            O Gabinete
          </h2>
          <p className="mt-4 text-base text-[#5c6f64]">
            Instalações preparadas para proporcionar privacidade, conforto e serenidade. Um ambiente acolhedor projetado para adultos, famílias e atendimento infantil.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveFilter("todas")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#2e6f40] ${activeFilter === "todas"
                ? "bg-[#2e6f40] text-white shadow-xs"
                : "bg-[#f8faf8] text-[#5c6f64] hover:bg-[#f0f6f2] hover:text-[#1d2a23] border border-[#d1e3d5]"
              }`}
          >
            Todas as Fotos ({galleryItems.length})
          </button>
          <button
            onClick={() => setActiveFilter("gabinete")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#2e6f40] ${activeFilter === "gabinete"
                ? "bg-[#2e6f40] text-white shadow-xs"
                : "bg-[#f8faf8] text-[#5c6f64] hover:bg-[#f0f6f2] hover:text-[#1d2a23] border border-[#d1e3d5]"
              }`}
          >
            Gabinete de Consulta
          </button>
          <button
            onClick={() => setActiveFilter("infantil")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#2e6f40] ${activeFilter === "infantil"
                ? "bg-[#2e6f40] text-white shadow-xs"
                : "bg-[#f8faf8] text-[#5c6f64] hover:bg-[#f0f6f2] hover:text-[#1d2a23] border border-[#d1e3d5]"
              }`}
          >
            Espaço Infantil
          </button>
          <button
            onClick={() => setActiveFilter("espera")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#2e6f40] ${activeFilter === "espera"
                ? "bg-[#2e6f40] text-white shadow-xs"
                : "bg-[#f8faf8] text-[#5c6f64] hover:bg-[#f0f6f2] hover:text-[#1d2a23] border border-[#d1e3d5]"
              }`}
          >
            Sala de Espera
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative bg-[#f8faf8] rounded-2xl overflow-hidden border border-[#d1e3d5] shadow-xs cursor-pointer hover:shadow-md hover:border-[#2e6f40] transition-all duration-300 flex flex-col"
            >
              <div className="relative w-full aspect-4/3 overflow-hidden bg-zinc-100">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white/90 text-[#1d2a23] text-xs font-medium px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs">
                    Ver Imagem
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white flex-1 flex flex-col justify-between border-t border-[#f0f6f2]">
                <h3 className="text-xs font-bold text-[#1d2a23] line-clamp-1">
                  {item.title}
                </h3>
                <span className="text-[11px] font-medium text-[#2e6f40] mt-1">
                  {item.categoryLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal Preview - Large centered presentation with object-contain */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl lg:max-w-6xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Container: Large height and width, fill with object-contain */}
            <div className="relative w-full h-[70vh] sm:h-[78vh] bg-zinc-950 flex items-center justify-center p-2 sm:p-4">
              <Image
                src={selectedImage.src}
                alt={selectedImage.title}
                fill
                className="object-contain p-2"
                sizes="100vw"
                priority
              />
              <button
                onClick={() => setSelectedImage(null)}
                aria-label="Fechar pré-visualização"
                className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white z-20 shadow-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Caption Footer */}
            <div className="w-full p-4 sm:p-5 bg-white flex items-center justify-between gap-4 border-t border-[#f0f6f2]">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#1d2a23]">
                  {selectedImage.title}
                </h4>
                <p className="text-xs text-[#5c6f64] mt-0.5">
                  {selectedImage.categoryLabel} • Gabinete Psicóloga Grace Azevedo da Graça (Ovar)
                </p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 bg-[#f0f6f2] text-[#2e6f40] hover:bg-[#2e6f40] hover:text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
