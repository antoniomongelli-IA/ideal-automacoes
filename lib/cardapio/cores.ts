"use client"
import type { Branding } from "./types"

// Detecta as cores da logo e monta a paleta do cardápio (tema escuro ou claro).

type RGB = [number, number, number]

const hex = ([r, g, b]: RGB) => "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase()

function rgbParaHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

function hslParaRgb(h: number, s: number, l: number): RGB {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}
const hsl = (h: number, s: number, l: number) => hex(hslParaRgb(h, s, l))

function luminancia([r, g, b]: RGB) {
  const c = (v: number) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
}
const doHex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
export const contraste = (a: string, b: string) => {
  const [l1, l2] = [luminancia(doHex(a)), luminancia(doHex(b))].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}
/** Texto que fica legível em cima da cor (branco ou quase preto). */
export const textoSobre = (cor: string) => (contraste(cor, "#FFFFFF") >= contraste(cor, "#141414") ? "#FFFFFF" : "#141414")

const distanciaMatiz = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b))

export interface CoresLogo {
  /** cores de destaque encontradas, da mais forte para a menos */
  cores: string[]
  principal: string
  destaque: string
  /** a logo é escura (sugere tema escuro) */
  logoEscura: boolean
}

/** Lê os pixels da logo e devolve as cores principais. */
export async function coresDaLogo(src: string): Promise<CoresLogo> {
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.src = src
  await img.decode()
  const lado = 96
  const canvas = document.createElement("canvas")
  canvas.width = lado
  canvas.height = lado
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!
  // SVG sem tamanho próprio também funciona: desenha esticado no quadrado
  ctx.drawImage(img, 0, 0, lado, lado)
  const { data } = ctx.getImageData(0, 0, lado, lado)

  const grupos = new Map<string, { n: number; soma: RGB }>()
  let escuros = 0
  let visiveis = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 140) continue // transparente
    visiveis++
    const rgb: RGB = [data[i], data[i + 1], data[i + 2]]
    if (luminancia(rgb) < 0.08) escuros++
    const chave = rgb.map((v) => v >> 4).join(",") // agrupa cores parecidas
    const g = grupos.get(chave) ?? { n: 0, soma: [0, 0, 0] }
    g.n++
    g.soma = [g.soma[0] + rgb[0], g.soma[1] + rgb[1], g.soma[2] + rgb[2]]
    grupos.set(chave, g)
  }

  const candidatas = [...grupos.values()]
    .map((g) => {
      const rgb: RGB = [g.soma[0] / g.n, g.soma[1] / g.n, g.soma[2] / g.n]
      const [h, s, l] = rgbParaHsl(rgb)
      // prefere cores vivas e médias (nem quase branco, nem quase preto)
      const viva = s > 0.22 && l > 0.18 && l < 0.85
      return { rgb, h, s, l, viva, pontos: g.n * (viva ? 0.4 + s : 0.05) }
    })
    .sort((a, b) => b.pontos - a.pontos)

  const vivas = candidatas.filter((c) => c.viva)
  const unicas: typeof vivas = []
  for (const c of vivas) if (!unicas.some((u) => distanciaMatiz(u.h, c.h) < 18 && Math.abs(u.l - c.l) < 0.2)) unicas.push(c)

  const principal = unicas[0]
  const outra = unicas.find((c) => principal && distanciaMatiz(c.h, principal.h) > 35)
  const p = principal ? hex(principal.rgb) : "#E4572E"
  const d = outra ? hex(outra.rgb) : principal ? hsl((principal.h + 40) % 360, Math.min(1, principal.s + 0.1), 0.62) : "#FFC914"
  return { cores: unicas.slice(0, 6).map((c) => hex(c.rgb)), principal: p, destaque: d, logoEscura: visiveis > 0 && escuros / visiveis > 0.45 }
}

/** Monta as cores do cardápio a partir da cor principal e do destaque. */
export function paletaCardapio(principal: string, destaque: string, tema: "escuro" | "claro"): Pick<Branding, "primary" | "onPrimary" | "accent" | "bg" | "surface" | "text" | "muted"> {
  const [h, s, l] = rgbParaHsl(doHex(principal))
  let primary = principal
  if (tema === "escuro") {
    // no fundo escuro a cor principal precisa aparecer: clareia se for escura demais
    if (l < 0.42) primary = hsl(h, Math.max(s, 0.5), 0.5)
    const bg = hsl(h, Math.min(s, 0.35) * 0.6, 0.06)
    return {
      primary,
      onPrimary: textoSobre(primary),
      accent: destaque,
      bg,
      surface: hsl(h, Math.min(s, 0.3) * 0.5, 0.115),
      text: "#F7F5F2",
      muted: hsl(h, 0.1, 0.68),
    }
  }
  if (l > 0.62) primary = hsl(h, Math.max(s, 0.5), 0.45)
  return {
    primary,
    onPrimary: textoSobre(primary),
    accent: destaque,
    bg: hsl(h, Math.min(s, 0.5) * 0.45, 0.965),
    surface: "#FFFFFF",
    text: hsl(h, 0.3, 0.12),
    muted: hsl(h, 0.1, 0.42),
  }
}
