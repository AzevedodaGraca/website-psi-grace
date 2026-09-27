import Image from "next/image";
import Link from "next/link";

interface TreeLogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export default function TreeLogo({
  className = "",
  showText = true,
  size = 40,
}: TreeLogoProps) {
  return (
    <Link
      href="/#inicio"
      className={`inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2e6f40] rounded-lg ${className}`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        <Image
          src="/assets/branding/arvore.png"
          alt="Árvore da Identidade Visual Grace Azevedo da Graça"
          width={size}
          height={size}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight text-[#1d2a23] group-hover:text-[#2e6f40] transition-colors leading-snug">
            Grace Azevedo da Graça
          </span>
          <span className="text-xs text-[#5c6f64] font-medium tracking-wide">
            Psicóloga Clínica • OPP 25999
          </span>
        </div>
      )}
    </Link>
  );
}
