"use client"
import Image from "next/image"
import { GradientButton } from "@/components/ui/GradientButton"
import { WHATSAPP_NUMBER } from "@/lib/constants"

export function Navbar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Image src="/logo.png" alt="Ideal Automações" width={48} height={48} className="rounded-lg" />

        <nav className="hidden md:flex items-center gap-8 text-sm text-text-muted">
          <button onClick={() => scrollTo("servicos")} className="hover:text-text-primary transition-colors">Serviços</button>
          <button onClick={() => scrollTo("cases")} className="hover:text-text-primary transition-colors">Cases</button>
          <button onClick={() => scrollTo("sobre")} className="hover:text-text-primary transition-colors">Sobre</button>
          <button onClick={() => scrollTo("contato")} className="hover:text-text-primary transition-colors">Contato</button>
        </nav>

        <GradientButton href={`https://wa.me/${WHATSAPP_NUMBER}`} variant="primary">
          Falar no WhatsApp
        </GradientButton>
      </div>
    </header>
  )
}
