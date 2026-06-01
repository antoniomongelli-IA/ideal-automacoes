import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LenisProvider } from "@/components/shared/LenisProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ideal Automações — Automação e IA para Empresas",
  description: "Agentes de IA e automações que eliminam trabalho manual, aceleram atendimento e aumentam suas vendas. Atendemos imobiliárias, clínicas, e-commerces e muito mais.",
  keywords: "automação, inteligência artificial, WhatsApp, n8n, agente IA, SDR automatizado",
  openGraph: {
    title: "Ideal Automações",
    description: "Sua empresa no piloto automático.",
    images: ["/og-image.png"],
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.className} bg-bg text-text-primary antialiased`}>
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
