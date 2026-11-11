import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pontos de Umbanda | Acervo de Orixás e Guias",
  description:
    "Cadastre, busque e leia pontos cantados de Umbanda separados por categorias de Orixás e Guias.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
