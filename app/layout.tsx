import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pagarpix.org"),
  title: {
    default: "PagarPIX — Infraestrutura PIX para empresas",
    template: "%s | PagarPIX"
  },
  description:
    "API PIX, checkout, links de pagamento, webhooks, roteamento e conta empresarial BRL sobre o XPayments Core.",
  applicationName: "PagarPIX",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "PagarPIX — Infraestrutura PIX para empresas",
    description: "Aceite, movimente e concilie pagamentos PIX em uma única plataforma.",
    type: "website",
    locale: "pt_BR"
  }
};

export const viewport: Viewport = {
  themeColor: "#071714",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
