import Image from "next/image"
import { Mail, MessageCircle, ArrowUpRight } from "lucide-react"

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

const WHATSAPP = "5567996329837"
const INSTAGRAM = "https://instagram.com/ideal.automacoes"
const EMAIL = "contato.ideaalautomacoes@gmail.com"

const NAV_LINKS = [
  { label: "Serviços", href: "#servicos" },
  { label: "Cases", href: "#cases" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
]

export function Footer() {
  return (
    <footer className="bg-surface border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Coluna 1 — Identidade */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Ideal Automações" width={40} height={40} className="rounded-lg" />
              <div>
                <p className="font-bold text-text-primary leading-tight">Ideal Automações</p>
                <p className="text-xs text-text-muted">Automação & IA para Empresas</p>
              </div>
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Ajudamos PMEs brasileiras a crescer sem contratar mais, automatizando atendimento, vendas e processos com IA.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-text-muted hover:text-[#25D366] hover:border-[#25D366]/40 transition-colors"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href={`mailto:${EMAIL}`}
                aria-label="E-mail"
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Coluna 2 — Navegação */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-5">Navegação</p>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 — Contato */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-5">Fale com a gente</p>
            <div className="flex flex-col gap-4">
              <a
                href={`mailto:${EMAIL}`}
                className="text-sm text-text-muted hover:text-text-primary transition-colors break-all"
              >
                {EMAIL}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-fit"
              >
                <MessageCircle size={15} />
                Chamar no WhatsApp
                <ArrowUpRight size={13} />
              </a>
              <p className="text-xs text-text-muted">Seg–Sex, 9h–18h (GMT-4)</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
          <p>© 2025 Ideal Automações. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="/privacidade" className="hover:text-text-primary transition-colors">Política de Privacidade</a>
            <span className="text-white/10">·</span>
            <span>Desenvolvido pela <span className="text-accent font-medium">Ideal Automações</span></span>
          </div>
        </div>
      </div>
    </footer>
  )
}
