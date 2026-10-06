"use client"
import { createContext, useContext, useEffect, useRef } from "react"
import Image from "next/image"
import { Crown, Flame } from "lucide-react"
import type { Branding, Item, Restaurante } from "@/lib/cardapio/types"
import { posterSrc, videoSrc } from "@/lib/cardapio/utils"

export type { Aba } from "@/lib/cardapio/navegacao"

export interface MenuCtx {
  r: Restaurante
  ranks: Map<string, number>
  curtidos: Set<string>
  curtir: (id: string, forcar?: boolean) => void
  /**
   * Abre o vídeo do prato. Numa lista (Cardápio, Mais pedidos, Do mês), abre por
   * cima dela, rolando só por `lista`; no feed "Para você", pula para o prato.
   */
  abrirNoFeed: (id: string, lista?: string[]) => void
  abrirInfo: (id: string) => void
  /** aviso rápido no topo (ex.: "Link copiado") */
  avisar: (msg: string) => void
  item: (id: string) => Item | undefined
}

export const MenuContext = createContext<MenuCtx | null>(null)

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error("useMenu fora do MenuApp")
  return ctx
}

/** Vídeo mudo em loop que só toca quando está visível na tela. */
export function AutoVideo({ midia, className = "", priority = false }: { midia: string; className?: string; priority?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.5 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <div className={`overflow-hidden ${className || "relative"}`}>
      <Image src={posterSrc(midia)} alt="" fill sizes="(max-width: 480px) 100vw, 440px" className="object-cover" priority={priority} />
      <video
        ref={ref}
        poster={posterSrc(midia)}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoSrc(midia)} type="video/mp4" />
        <source src={videoSrc(midia, "webm")} type="video/webm" />
      </video>
    </div>
  )
}

export function SeloRank({ rank, size = "sm" }: { rank: number; size?: "sm" | "lg" }) {
  if (rank > 3) return null
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide ${size === "lg" ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]"}`}
      style={{ background: "var(--c-accent)", color: "#1a1208", borderRadius: "999px" }}
    >
      <Flame className={size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"} fill="currentColor" />
      #{rank} mais pedido
    </span>
  )
}

export function SeloMes({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide ${size === "lg" ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]"}`}
      style={{ background: "var(--c-primary)", color: "var(--c-on-primary)", borderRadius: "999px" }}
    >
      <Crown className={size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"} fill="currentColor" />
      Item do mês
    </span>
  )
}

/** Selo da marca: a logo em imagem, quando existe; senão a sigla/emoji na cor principal. */
export function LogoMarca({ b, size = 36, className = "" }: { b: Branding; size?: number; className?: string }) {
  const raio = Math.min(b.radius, size * 0.4)
  if (b.logo)
    return (
      // logo pode vir de upload (data URL) no painel, por isso <img> e não next/image
      // eslint-disable-next-line @next/next/no-img-element
      <img src={b.logo} alt={b.logoText} width={size} height={size} className={`shrink-0 object-contain ${className}`} style={{ width: size, height: size, borderRadius: raio }} />
    )
  return (
    <span
      className={`grid shrink-0 place-items-center font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.48, background: b.primary, color: b.onPrimary, borderRadius: raio, fontFamily: "var(--f-display)" }}
    >
      {b.logoMark}
    </span>
  )
}
