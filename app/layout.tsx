import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import MetaPixel from '@/components/MetaPixel';
import { SITE, negocioJsonLd, jsonLdSeguro } from '@/lib/site';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Título y descripción del inicio. Cada página define los suyos (con metaPagina de lib/seo.ts)
// y la plantilla agrega " | R&S Soluciones Solares" al final.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Paneles solares en Santiago · Venta e instalación | R&S Soluciones Solares",
    template: `%s | ${SITE.nombre}`,
  },
  description: SITE.descripcion,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: SITE.nombre,
    title: `${SITE.nombre} · Paneles solares en Santiago`,
    description: SITE.descripcion,
    url: "/",
    images: [{ url: SITE.imagen, alt: "Instalación de paneles solares de R&S Soluciones Solares" }],
  },
  // Para verificar Google Search Console con etiqueta HTML (opcional si se verifica por DNS):
  // define NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION en Vercel con el código que entrega Google.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-corp-light">
        {/* Datos estructurados: le dicen a Google qué es el negocio, dónde está y cómo contactarlo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSeguro(negocioJsonLd()) }}
        />
        <MetaPixel />
        <Navbar />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}