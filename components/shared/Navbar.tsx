"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Ideal Automações" width={40} height={40} />
          <span className="font-bold text-sm text-text-primary hidden sm:block leading-tight">
            Ideal<br /><span className="text-accent">Automações</span>
          </span>
        </div>

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

        <GradientButton href={`https://wa.me/${WHATSAPP_NUMBER}`} variant="primary">
          Falar no WhatsApp
        </GradientButton>
      </div>
    </header>
  )
}
