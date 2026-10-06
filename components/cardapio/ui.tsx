"use client"
import { createContext, useContext, useEffect, useRef } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Crown, Flame, X } from "lucide-react"
import type { Branding, Item, Restaurante } from "@/lib/cardapio/types"
import { capaDe, rankingPorVendas, videosDe } from "@/lib/cardapio/utils"

export type { Aba } from "@/lib/cardapio/navegacao"

export interface MenuCtx {
  r: Restaurante
  ranks: Map<string, number>
  curtidos: Set<string>
  curtir: (id: string, forcar?: boolean) => void
  /** total de curtidas do item, já contando a curtida desta pessoa */
  curtidasDe: (id: string) => number
  /**
   * Abre o vídeo do prato. Numa lista (Cardápio, Mais pedidos, Do mês), abre por
   * cima dela, rolando só por `lista`; no feed "Para você", pula para o prato.
   */
  abrirNoFeed: (id: string, lista?: string[]) => void
  abrirInfo: (id: string) => void
  /** a pessoa compartilhou um item (pode oferecer a conta) */
  compartilhou: (id: string) => void
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

type ItemMidia = Pick<Item, "nome" | "video" | "poster" | "foto">

/**
 * Capa do item (poster do vídeo ou foto). Imagens do Storage vêm prontas e
 * comprimidas, então não passam pelo otimizador do Next.
 * Sem vídeo, a foto ganha um zoom lento (efeito "Ken Burns") para não ficar parada.
 */
export function Capa({ item, sizes, priority = false, zoom = false, className = "object-cover" }: { item: ItemMidia; sizes: string; priority?: boolean; zoom?: boolean; className?: string }) {
  const src = capaDe(item)
  if (!src)
    return (
      <span className="absolute inset-0 grid place-items-center text-5xl" style={{ background: "linear-gradient(135deg, var(--c-surface), var(--c-bg))" }}>
        🍽️
      </span>
    )
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={/^https?:/.test(src)}
      className={`${className} ${zoom ? "animate-[kenburns_14s_ease-in-out_infinite_alternate]" : ""}`}
    />
  )
}

/** Vídeo mudo em loop que só toca quando está visível na tela. Sem vídeo, mostra a foto com zoom. */
export function AutoVideo({ item, className = "", priority = false }: { item: ItemMidia; className?: string; priority?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const fontes = videosDe(item)

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
      <Capa item={item} sizes="(max-width: 480px) 100vw, 440px" priority={priority} zoom={!fontes.length} />
      {fontes.length > 0 && (
        <video ref={ref} poster={capaDe(item) || undefined} muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover">
          {fontes.map((f) => (
            <source key={f.src} src={f.src} type={f.type} />
          ))}
        </video>
      )}
    </div>
  )
}

export function SeloRank({ rank, size = "sm" }: { rank: number; size?: "sm" | "lg" }) {
  const ctx = useContext(MenuContext)
  if (rank > 3) return null
  const porVendas = ctx ? rankingPorVendas(ctx.r.itens) : true
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide ${size === "lg" ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]"}`}
      style={{ background: "var(--c-accent)", color: "#1a1208", borderRadius: "999px" }}
    >
      <Flame className={size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"} fill="currentColor" />
      #{rank} {porVendas ? "mais pedido" : "em alta"}
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

/** Folha que sobe de baixo (detalhes, favoritos, conta). Arrastar para baixo fecha. */
export function Folha({ aberta, fechar, children }: { aberta: boolean; fechar: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {aberta && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fechar} className="absolute inset-0 z-40 bg-black/55" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => i.offset.y > 120 && fechar()}
            className="absolute inset-x-0 bottom-0 z-50 max-h-[82%] overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3"
            style={{ background: "var(--c-surface)", color: "var(--c-text)", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full" style={{ background: "color-mix(in srgb, var(--c-text) 20%, transparent)" }} />
            <button onClick={fechar} aria-label="Fechar" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--c-text) 8%, transparent)" }}>
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
