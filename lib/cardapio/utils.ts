import type { CSSProperties } from "react"
import type { Branding, FontKey, Item, Promocao, Restaurante } from "./types"

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

// ------------------------------------------------------------------ promoções

const minutos = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** "18:00" → "18h"; "18:30" → "18h30" */
export const hora = (hhmm: string) => {
  const [h, m] = hhmm.split(":")
  return `${Number(h)}h${m && m !== "00" ? m : ""}`
}

export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

/**
 * A promoção está valendo neste momento? Usa o relógio do celular de quem vê o
 * cardápio (que está no próprio estabelecimento, no mesmo fuso).
 */
export function promoNoAr(p: Promocao, agora: Date) {
  const ini = minutos(p.inicio)
  const fim = minutos(p.fim)
  const m = agora.getHours() * 60 + agora.getMinutes()
  const dia = agora.getDay()
  if (ini === fim) return p.dias.includes(dia)
  if (ini < fim) return p.dias.includes(dia) && m >= ini && m < fim
  // passa da meia-noite (ex.: 22h às 2h): começa no dia marcado e termina no dia seguinte
  return (p.dias.includes(dia) && m >= ini) || (p.dias.includes((dia + 6) % 7) && m < fim)
}

/** Texto curto de até quando vale: "até 20h" (ou "hoje", quando é o dia todo). */
export const promoAte = (p: Promocao) => (p.inicio === p.fim ? "hoje" : `até ${hora(p.fim)}`)

/** Resumo dos dias e horários: "Seg a Sex · 18h às 20h" */
export function promoQuando(p: Promocao) {
  const d = [...p.dias].sort()
  let dias = d.map((x) => DIAS_SEMANA[x]).join(", ")
  if (d.length === 7) dias = "Todos os dias"
  else if (d.length > 2 && d.every((x, i) => i === 0 || x === d[i - 1] + 1)) dias = `${DIAS_SEMANA[d[0]]} a ${DIAS_SEMANA[d[d.length - 1]]}`
  else if (d.length === 0) dias = "Nenhum dia"
  return p.inicio === p.fim ? `${dias} · o dia todo` : `${dias} · ${hora(p.inicio)} às ${hora(p.fim)}`
}

/** Aplica as promoções valendo agora: o item ganha o preço promocional e o selo. */
export function aplicarPromocoes(r: Restaurante, ativas: Promocao[]): Restaurante {
  if (!ativas.length) return r
  const porItem = new Map(ativas.filter((p) => p.itemId).map((p) => [p.itemId!, p]))
  return {
    ...r,
    itens: r.itens.map((it) => {
      const p = porItem.get(it.id)
      if (!p) return it
      const baixou = p.precoPromo !== undefined && p.precoPromo < it.preco
      return {
        ...it,
        preco: baixou ? p.precoPromo! : it.preco,
        precoAntigo: baixou ? it.preco : it.precoAntigo,
        promo: { titulo: p.titulo, ate: promoAte(p) },
      }
    }),
  }
}

// ------------------------------------------------------------------ WhatsApp

/** Só dígitos, com 55 na frente (igual ao banco). */
export function telefone55(t: string) {
  let d = t.replace(/\D/g, "").replace(/^0+/, "")
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2)
  return d ? `55${d}` : ""
}

/** Link do "Pedir pelo WhatsApp" com a mensagem pronta. */
export function linkPedidoWhatsapp(whatsapp: string, item: Pick<Item, "nome" | "preco">, linkItem: string) {
  const texto = `Olá! Vi no cardápio digital e quero pedir:\n\n*${item.nome}* — ${brl(item.preco)}${linkItem ? `\n\n${linkItem}` : ""}`
  return `https://wa.me/${telefone55(whatsapp)}?text=${encodeURIComponent(texto)}`
}
