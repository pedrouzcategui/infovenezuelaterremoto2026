import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";
import { Footer } from "./components/Footer";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://infovenezuelaterremoto.org";
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Info Venezuela Terremoto — Centros verificados, ayuda garantizada",
    template: "%s — Info Venezuela Terremoto",
  },
  description:
    "Centros de acopio verificados, números de emergencia, servicios gratuitos y noticias durante el terremoto de Venezuela de junio 2026. Los Teques, Carrizal, San Antonio de los Altos y Caracas.",
  keywords: [
    "centros de acopio",
    "terremoto Venezuela",
    "sismo Venezuela 2026",
    "donaciones Venezuela",
    "Los Teques",
    "Carrizal",
    "San Antonio de los Altos",
    "Caracas",
    "ayuda humanitaria",
    "Altos Mirandinos",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: siteUrl,
    siteName: "Info Venezuela Terremoto",
    title: "Centros Verificados, Ayuda Garantizada",
    description:
      "Centros de acopio verificados, números de emergencia, servicios gratuitos y noticias durante el terremoto de Venezuela de junio 2026.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Centros Verificados, Ayuda Garantizada",
    description:
      "Dónde donar y encontrar ayuda durante el terremoto de Venezuela de junio 2026.",
  },
  robots: { index: true, follow: true },
};

// Evita el parpadeo de tema. Por defecto: oscuro (estética táctica).
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':true;if(d)document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col overflow-x-hidden"
        suppressHydrationWarning
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <SiteHeader />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-6 pt-20 sm:px-6 lg:px-8">
          {children}
        </main>

        <Footer />
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
