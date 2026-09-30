import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configuración de la barra de pestañas y SEO
export const metadata: Metadata = {
  title: "RYS Soluciones Solares",
  description: "Especialistas en instalación y mantención de paneles solares. Energía limpia y eficiente para tu hogar o empresa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es" // Cambiado a "es" para que los navegadores sepan que está en español
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-corp-light">
        <Navbar />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
