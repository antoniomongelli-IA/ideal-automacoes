"use client"
import { useRef, useSyncExternalStore } from "react"
import { ChevronLeft } from "lucide-react"
import { temVoltarNativo } from "@/lib/cardapio/navegacao"

const nunca = () => () => {}

/**
 * Arrastar da borda esquerda para voltar, como no iPhone.
 * No iPhone/iPad o gesto nativo do navegador já faz isso (a navegação usa o
 * histórico), então aqui ele só liga no Android, no computador e nas prévias.
 */
export function ArrastarVoltar({ podeVoltar, voltar, embutido, children }: { podeVoltar: boolean; voltar: () => void; embutido: boolean; children: React.ReactNode }) {
  const nativo = useSyncExternalStore(nunca, temVoltarNativo, () => false)
  const conteudo = useRef<HTMLDivElement>(null)
  const fundo = useRef<HTMLDivElement>(null)
  const seta = useRef<HTMLDivElement>(null)
  const gesto = useRef<{ x0: number; y0: number; t0: number; dx: number; travado: boolean | null } | null>(null)

  const ligado = podeVoltar && (embutido || !nativo)

  const pintar = (dx: number, animar: boolean) => {
    const el = conteudo.current
    if (!el) return
    const largura = el.offsetWidth || 1
    const k = Math.min(1, dx / (largura * 0.35))
    el.style.transition = animar ? "transform 220ms cubic-bezier(.2,.8,.2,1)" : "none"
    el.style.transform = dx ? `translateX(${dx}px)` : ""
    el.style.boxShadow = dx ? "-12px 0 32px rgba(0,0,0,.45)" : ""
    if (fundo.current) {
      fundo.current.style.transition = el.style.transition.replace("transform", "opacity")
      fundo.current.style.opacity = String(dx ? 0.35 + k * 0.65 : 0)
    }
    if (seta.current) seta.current.style.transform = `translateX(${Math.min(dx * 0.4, 40)}px) scale(${0.7 + k * 0.4})`
  }

  const soltar = () => {
    const g = gesto.current
    gesto.current = null
    if (!g || !g.travado) return pintar(0, true)
    const largura = conteudo.current?.offsetWidth ?? 400
    const velocidade = g.dx / Math.max(1, performance.now() - g.t0)
    if (g.dx > largura * 0.35 || (g.dx > 40 && velocidade > 0.6)) {
      pintar(largura, true)
      setTimeout(() => {
        voltar()
        requestAnimationFrame(() => pintar(0, false))
      }, 200)
    } else pintar(0, true)
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {ligado && (
        <div ref={fundo} className="pointer-events-none absolute inset-0 flex items-center bg-black opacity-0">
          <div ref={seta} className="ml-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
            <ChevronLeft className="h-6 w-6" />
          </div>
        </div>
      )}
      <div ref={conteudo} className="absolute inset-0">
        {children}
      </div>
      {ligado && (
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 z-[45] w-4 cursor-grab"
          style={{ touchAction: "pan-y" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            gesto.current = { x0: e.clientX, y0: e.clientY, t0: performance.now(), dx: 0, travado: null }
          }}
          onPointerMove={(e) => {
            const g = gesto.current
            if (!g) return
            const dx = e.clientX - g.x0
            const dy = e.clientY - g.y0
            // decide se o gesto é horizontal antes de mover a tela
            if (g.travado === null && Math.hypot(dx, dy) > 8) g.travado = Math.abs(dx) > Math.abs(dy)
            if (!g.travado) return
            g.dx = Math.max(0, dx)
            pintar(g.dx, false)
          }}
          onPointerUp={soltar}
          onPointerCancel={soltar}
        />
      )}
    </div>
  )
}
