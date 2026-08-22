"use client";

import { useEffect } from "react";
import Link from "next/link";
import TreeLogo from "../shared/TreeLogo";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { name: string; href: string }[];
}

export default function MobileNav({
  isOpen,
  onClose,
  navLinks,
}: MobileNavProps) {
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out border-l border-[#d1e3d5]">
        <div>
          {/* Header row inside drawer */}
          <div className="flex items-center justify-between pb-6 border-b border-[#f0f6f2]">
            <TreeLogo size={36} />
            <button
              onClick={onClose}
              aria-label="Fechar menu"
              className="p-2 text-[#5c6f64] hover:text-[#1d2a23] hover:bg-[#f0f6f2] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#2e6f40]"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="px-4 py-3 text-base font-medium text-[#1d2a23] hover:text-[#2e6f40] hover:bg-[#f0f6f2] rounded-xl transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer CTAs inside drawer */}
        <div className="pt-6 border-t border-[#f0f6f2] flex flex-col gap-3">
          <Link
            href="#marcacao"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-[#2e6f40] hover:bg-[#245933] rounded-xl shadow-xs transition-colors text-center"
          >
            Marcar Consulta
          </Link>

          <a
            href="https://wa.me/351926362033?text=Ol%C3%A1%2C%20gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20as%20consultas."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl transition-colors text-center"
          >
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            WhatsApp (+351 926 362 033)
          </a>
        </div>
      </div>
    </div>
  );
}
