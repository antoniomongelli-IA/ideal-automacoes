import Image from "next/image"
import { Share2, Globe, MessageCircle } from "lucide-react"
import { WHATSAPP_NUMBER } from "@/lib/constants"

export function Footer() {
  return (
    <footer className="bg-surface border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Ideal Automações" width={36} height={36} className="rounded-lg" />
          <div>
            <p className="font-semibold text-text-primary">Ideal Automações</p>
            <p className="text-xs text-text-muted">Automação & IA para Empresas</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-text-muted">
          <a href="#servicos" className="hover:text-text-primary transition-colors">Serviços</a>
          <a href="#cases" className="hover:text-text-primary transition-colors">Cases</a>
          <a href="#contato" className="hover:text-text-primary transition-colors">Contato</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors">
            <Share2 size={20} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors">
            <Globe size={20} />
          </a>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors">
            <MessageCircle size={20} />
          </a>
        </div>
      </div>
      <p className="text-center text-xs text-text-muted mt-8">© 2025 Ideal Automações. Todos os direitos reservados.</p>
    </footer>
  )
}
