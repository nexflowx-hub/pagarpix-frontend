import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import "./styles/v25.css";
import "./styles/v26.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pagarpix.org"),
  title: {
    default: "PagarPIX — Infraestrutura PIX para empresas",
    template: "%s | PagarPIX"
  },
  description:
    "API PIX, checkout, links de pagamento, webhooks, roteamento e conta empresarial BRL sobre o XPayments Core.",
  applicationName: "PagarPIX",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg"
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "PagarPIX — Infraestrutura PIX para empresas",
    description: "Aceite, movimente e concilie pagamentos PIX em uma única plataforma.",
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "PagarPIX",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "PagarPIX — Infraestrutura PIX" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "PagarPIX — Infraestrutura PIX para empresas",
    description: "Receba PIX, roteie melhor e concilie a sua operação sobre o XPayments Core.",
    images: ["/opengraph-image"]
  },
  category: "financial technology"
};

export const viewport: Viewport = {
  themeColor: "#06130f",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
