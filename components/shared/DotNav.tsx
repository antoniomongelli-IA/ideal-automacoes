"use client"
import { useEffect, useState } from "react"

const SECTIONS = [
  { id: "hero",          label: "Início" },
  { id: "problema",      label: "Seus Problemas" },
  { id: "servicos",      label: "Serviços" },
  { id: "como-funciona", label: "Como Funciona" },
  { id: "garantia",      label: "Sem Risco" },
  { id: "cases",         label: "Cases" },
  { id: "depoimentos",   label: "Depoimentos" },
  { id: "nichos",        label: "Nichos" },
  { id: "tecnologias",   label: "Tecnologias" },
  { id: "sobre",         label: "Sobre" },
  { id: "faq",           label: "FAQ" },
  { id: "contato",       label: "Contato" },
]

export function DotNav() {
  const [active, setActive] = useState("hero")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav
      aria-label="Navegação por seções"
      className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-2.5 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id
        const isHovered = hoveredId === id
        return (
          <div key={id} className="relative flex items-center justify-end">
            {/* Tooltip */}
            <span
              className="absolute right-full mr-3 whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-md pointer-events-none select-none transition-all duration-200"
              style={{
                background: "rgba(17,15,30,0.92)",
                border: "1px solid rgba(160,32,240,0.25)",
                color: "#F4F0FF",
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? "translateX(0)" : "translateX(4px)",
              }}
            >
              {label}
            </span>

            {/* Dot */}
            <button
              onClick={() => scrollTo(id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label={`Ir para ${label}`}
              className="rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: isActive ? 10 : 6,
                height: isActive ? 10 : 6,
                background: isActive
                  ? "#A020F0"
                  : isHovered
                  ? "rgba(160,32,240,0.6)"
                  : "rgba(139,128,168,0.35)",
                boxShadow: isActive ? "0 0 8px rgba(160,32,240,0.7)" : "none",
              }}
            />
          </div>
        )
      })}
    </nav>
  )
}
