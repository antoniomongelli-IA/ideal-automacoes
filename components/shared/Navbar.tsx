"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { GradientButton } from "@/components/ui/GradientButton"
import { WHATSAPP_NUMBER } from "@/lib/constants"

const NAV_ITEMS = [
  { label: "Serviços", id: "servicos" },
  { label: "Como Funciona", id: "como-funciona" },
  { label: "Cases", id: "cases" },
  { label: "Sobre", id: "sobre" },
  { label: "Contato", id: "contato" },
]

export function Navbar() {
  const [active, setActive] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    )
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Fechar menu ao redimensionar para desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Bloquear scroll do body quando menu aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }, menuOpen ? 300 : 0)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Ideal Automações" width={40} height={40} />
            <span className="font-bold text-sm text-text-primary hidden sm:block leading-tight">
              Ideal<br /><span className="text-accent">Automações</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {NAV_ITEMS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="relative py-1 transition-colors duration-200"
                style={{ color: active === id ? "#F4F0FF" : "#8B80A8" }}
              >
                {label}
                {active === id && (
                  <span
                    className="absolute -bottom-0.5 left-0 right-0 h-px rounded-full"
                    style={{ background: "linear-gradient(90deg, #A020F0, #CC44FF)" }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <GradientButton href={`https://wa.me/${WHATSAPP_NUMBER}`} variant="primary">
              <span className="hidden sm:inline">Falar no WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </GradientButton>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-text-muted hover:text-text-primary hover:border-white/20 transition-all"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-surface border-l border-white/8 flex flex-col gap-0 md:hidden transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <span className="font-bold text-sm text-text-primary leading-tight">
            Ideal <span className="text-accent">Automações</span>
          </span>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-text-muted"
            onClick={() => setMenuOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-4 py-6 gap-1">
          {NAV_ITEMS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-medium transition-all duration-200"
              style={{
                color: active === id ? "#F4F0FF" : "#8B80A8",
                background: active === id ? "rgba(160,32,240,0.08)" : "transparent",
                borderLeft: active === id ? "2px solid #A020F0" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="mt-auto px-6 pb-8">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent/90 text-white font-semibold px-5 py-3.5 rounded-xl transition-colors text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </>
  )
}
