import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://grcpsi.pt"),
  title: "Grace Azevedo da Graça | Psicóloga Clínica em Ovar - OPP 25999",
  description:
    "Gabinete de Psicologia Clínica em Ovar, Aveiro. Atendimento presencial e online para crianças, adolescentes, adultos, casais e famílias. Registo OPP 25999.",
  keywords: [
    "Psicóloga em Ovar",
    "Psicologia Clínica Ovar",
    "Grace Azevedo da Graça",
    "OPP 25999",
    "Atendimento Online",
    "Terapia de Casal Ovar",
    "Psicologia Aveiro",
  ],
  authors: [{ name: "Grace Azevedo da Graça" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Grace Azevedo da Graça | Psicóloga Clínica em Ovar - OPP 25999",
    description:
      "Gabinete de Psicologia Clínica em Ovar. Atendimento presencial e online para crianças, adolescentes, adultos, casais e famílias. Registo OPP 25999.",
    siteName: "Grace Azevedo da Graça - Psicóloga Clínica",
    locale: "pt_PT",
    type: "website",
    images: [
      {
        url: "/assets/branding/arvore.png",
        width: 800,
        height: 600,
        alt: "Identidade Visual Psicóloga Grace Azevedo da Graça",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grace Azevedo da Graça | Psicóloga Clínica em Ovar - OPP 25999",
    description:
      "Gabinete de Psicologia Clínica em Ovar, Aveiro. Atendimento presencial e online. Registo OPP 25999.",
    images: ["/assets/branding/arvore.png"],
  },
  icons: {
    icon: "/assets/branding/arvore.png",
    shortcut: "/assets/branding/arvore.png",
    apple: "/assets/branding/arvore.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#1d2a23]">
        {children}
      </body>
    </html>
  );
}
