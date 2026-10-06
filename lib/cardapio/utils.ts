import type { CSSProperties } from "react"
import type { Branding, FontKey, Item, Tag } from "./types"

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export const compacto = (n: number) =>
  n >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : String(n)

export const videoSrc = (midia: string, ext: "mp4" | "webm" = "mp4") => `/cardapio/videos/${midia}.${ext}`
export const posterSrc = (midia: string) => `/cardapio/posters/${midia}.jpg`

export function maisPedidos(itens: Item[]) {
  return [...itens].sort((a, b) => b.pedidos30d - a.pedidos30d)
}

export function rankDe(itens: Item[]) {
  const map = new Map<string, number>()
  maisPedidos(itens).forEach((it, i) => map.set(it.id, i + 1))
  return map
}

export function crescimento(it: Item) {
  return Math.round(((it.pedidos30d - it.pedidosMesAnterior) / it.pedidosMesAnterior) * 100)
}

/** Ordem do feed "Para você": itens do mês primeiro, depois os mais curtidos. */
export function ordemFeed(itens: Item[]) {
  return [...itens].sort((a, b) => Number(!!b.destaqueDoMes) - Number(!!a.destaqueDoMes) || b.curtidas - a.curtidas)
}

export const mesAtual = () => {
  const m = new Date().toLocaleDateString("pt-BR", { month: "long" })
  return m.charAt(0).toUpperCase() + m.slice(1)
}

export const TAGS: Record<Tag, { label: string; emoji: string }> = {
  vegetariano: { label: "Vegetariano", emoji: "🌱" },
  picante: { label: "Picante", emoji: "🌶️" },
  novo: { label: "Novidade", emoji: "✨" },
  "sem-gluten": { label: "Sem glúten", emoji: "🌾" },
  compartilhar: { label: "Para dividir", emoji: "👥" },
  alcoolico: { label: "+18", emoji: "🔞" },
}

export const FONTES: Record<FontKey, { label: string; css: string }> = {
  anton: { label: "Anton — impacto", css: "var(--font-anton), Impact, sans-serif" },
  fraunces: { label: "Fraunces — clássica", css: "var(--font-fraunces), Georgia, serif" },
  shippori: { label: "Shippori — oriental", css: "var(--font-shippori), serif" },
  bricolage: { label: "Bricolage — moderna", css: "var(--font-bricolage), system-ui, sans-serif" },
  playfair: { label: "Playfair — elegante", css: "var(--font-playfair), Georgia, serif" },
  jakarta: { label: "Jakarta — neutra", css: "var(--font-jakarta), system-ui, sans-serif" },
}

/** Converte o branding do restaurante em variáveis CSS usadas por todo o cardápio. */
export function brandingVars(b: Branding): CSSProperties {
  return {
    "--c-primary": b.primary,
    "--c-on-primary": b.onPrimary,
    "--c-accent": b.accent,
    "--c-bg": b.bg,
    "--c-surface": b.surface,
    "--c-text": b.text,
    "--c-muted": b.muted,
    "--radius": `${b.radius}px`,
    "--f-display": FONTES[b.fontDisplay].css,
    "--f-body": FONTES[b.fontBody].css,
    fontFamily: "var(--f-body)",
    background: b.bg,
    color: b.text,
  } as CSSProperties
}
