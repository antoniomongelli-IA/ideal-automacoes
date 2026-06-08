import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { LenisProvider } from "@/components/shared/LenisProvider"
import { ScrollEffects } from "@/components/shared/ScrollEffects"
import { CustomCursor } from "@/components/shared/CustomCursor"
import { PageLoader } from "@/components/shared/PageLoader"
import { DotNav } from "@/components/shared/DotNav"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
})

export const metadata: Metadata = {
  title: "Ideal Automações: Automação e IA para Empresas",
  description: "Agentes de IA e automações que eliminam trabalho manual, aceleram atendimento e aumentam suas vendas. Atendemos imobiliárias, clínicas, e-commerces e muito mais.",
  keywords: "automação, inteligência artificial, WhatsApp, n8n, agente IA, SDR automatizado",
  openGraph: {
    title: "Ideal Automações",
    description: "Sua empresa no piloto automático.",
    images: ["/og-image"],
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${jakarta.variable} font-sans bg-bg text-text-primary antialiased`}>
        <CustomCursor />
        <PageLoader />
        <DotNav />
        <LenisProvider>
          <ScrollEffects />
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
