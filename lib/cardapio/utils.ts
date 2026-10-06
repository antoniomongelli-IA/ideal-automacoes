import type { CSSProperties } from "react"
import type { Branding, FontKey, Item } from "./types"

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export const compacto = (n: number) =>
  n >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : String(n)

/** Imagem que representa o item (capa do vídeo ou foto). */
export const capaDe = (it: { poster?: string; foto?: string }) => it.poster || it.foto || ""

/** Fontes do vídeo. Os vídeos da demo também têm versão .webm (navegadores sem H.264). */
export function videosDe(it: { video?: string }) {
  if (!it.video) return []
  const lista = [{ src: it.video, type: it.video.endsWith(".webm") ? "video/webm" : "video/mp4" }]
  if (it.video.startsWith("/midia/") && it.video.endsWith(".mp4")) lista.push({ src: it.video.replace(/\.mp4$/, ".webm"), type: "video/webm" })
  return lista
}

/** O ranking usa as vendas do mês quando o estabelecimento informa; senão, vídeos vistos + curtidas. */
export const rankingPorVendas = (itens: Item[]) => itens.some((i) => i.pedidos30d > 0)
const pontos = (it: Item, porVendas: boolean) => (porVendas ? it.pedidos30d : (it.vistos30d ?? 0) + it.curtidas * 3)

export function maisPedidos(itens: Item[]) {
  const porVendas = rankingPorVendas(itens)
  return [...itens].sort((a, b) => pontos(b, porVendas) - pontos(a, porVendas))
}

export function rankDe(itens: Item[]) {
  const map = new Map<string, number>()
  maisPedidos(itens).forEach((it, i) => map.set(it.id, i + 1))
  return map
}

/** Crescimento das vendas vs. mês anterior (null quando não dá para calcular). */
export function crescimento(it: Item) {
  if (!it.pedidos30d || !it.pedidosMesAnterior) return null
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

/** Etiquetas prontas que o estabelecimento marca nos itens. */
export const TAGS: Record<string, { label: string; emoji: string }> = {
  "+18": { label: "+18", emoji: "🔞" },
  alcoolico: { label: "+18", emoji: "🔞" },
  vegetariano: { label: "Vegetariano", emoji: "🌱" },
  vegano: { label: "Vegano", emoji: "🥬" },
  "sem-gluten": { label: "Sem glúten", emoji: "🌾" },
  "sem-lactose": { label: "Sem lactose", emoji: "🥛" },
  picante: { label: "Picante", emoji: "🌶️" },
  novo: { label: "Novidade", emoji: "✨" },
  compartilhar: { label: "Para dividir", emoji: "👥" },
  "mais-vendido": { label: "Mais vendido", emoji: "🔥" },
  "do-chef": { label: "Sugestão do chef", emoji: "👨‍🍳" },
  promocao: { label: "Promoção", emoji: "🏷️" },
  "zero-acucar": { label: "Zero açúcar", emoji: "🍬" },
  fit: { label: "Fit", emoji: "💪" },
  gelado: { label: "Gelado", emoji: "🧊" },
  quente: { label: "Quente", emoji: "♨️" },
  kids: { label: "Kids", emoji: "🧒" },
}

/** Etiquetas oferecidas no painel (sem repetir o +18). */
export const TAGS_PAINEL = Object.keys(TAGS).filter((t) => t !== "alcoolico")

/** Rótulo de qualquer etiqueta: as prontas têm emoji; as livres aparecem como foram escritas. */
export const tagInfo = (t: string) => TAGS[t] ?? { label: t, emoji: "🏷️" }

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
