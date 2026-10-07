import type { Branding, FontKey } from "./types"

/** Tipos de negócio atendidos. Cada um sugere fonte, categorias iniciais e frase de abertura. */
export interface Nicho {
  id: string
  nome: string
  emoji: string
  fonte: FontKey
  raio: number
  categorias: { nome: string; emoji: string }[]
  frase: string
}

export const NICHOS: Nicho[] = [
  { id: "hamburgueria", nome: "Hamburgueria", emoji: "🍔", fonte: "anton", raio: 14, frase: "Burger feito na hora, do jeito certo.", categorias: [{ nome: "Burgers", emoji: "🍔" }, { nome: "Porções", emoji: "🍟" }, { nome: "Bebidas", emoji: "🥤" }, { nome: "Sobremesas", emoji: "🍫" }] },
  { id: "pizzaria", nome: "Pizzaria", emoji: "🍕", fonte: "fraunces", raio: 20, frase: "Massa de longa fermentação, forno quente.", categorias: [{ nome: "Pizzas salgadas", emoji: "🍕" }, { nome: "Pizzas doces", emoji: "🍫" }, { nome: "Bebidas", emoji: "🥤" }] },
  { id: "japones", nome: "Japonês", emoji: "🍣", fonte: "shippori", raio: 6, frase: "Peixe fresco, corte preciso.", categorias: [{ nome: "Combinados", emoji: "🍱" }, { nome: "Peças", emoji: "🍣" }, { nome: "Quentes", emoji: "🍜" }, { nome: "Bebidas", emoji: "🍶" }] },
  { id: "restaurante", nome: "Restaurante", emoji: "🍽️", fonte: "playfair", raio: 18, frase: "Comida de verdade, feita com carinho.", categorias: [{ nome: "Entradas", emoji: "🥗" }, { nome: "Pratos principais", emoji: "🍽️" }, { nome: "Sobremesas", emoji: "🍰" }, { nome: "Bebidas", emoji: "🥤" }] },
  { id: "italiano", nome: "Italiano / Cantina", emoji: "🍝", fonte: "fraunces", raio: 22, frase: "Receita de família, do jeito da nonna.", categorias: [{ nome: "Massas", emoji: "🍝" }, { nome: "Pizzas", emoji: "🍕" }, { nome: "Vinhos", emoji: "🍷" }, { nome: "Dolci", emoji: "🍰" }] },
  { id: "bar", nome: "Bar / Boteco", emoji: "🍻", fonte: "anton", raio: 12, frase: "Chopp gelado e petisco bom.", categorias: [{ nome: "Petiscos", emoji: "🍢" }, { nome: "Chopp e cervejas", emoji: "🍺" }, { nome: "Drinks", emoji: "🍹" }, { nome: "Sem álcool", emoji: "🥤" }] },
  { id: "cafeteria", nome: "Cafeteria / Padaria", emoji: "☕", fonte: "playfair", raio: 16, frase: "Café passado na hora.", categorias: [{ nome: "Cafés", emoji: "☕" }, { nome: "Salgados", emoji: "🥐" }, { nome: "Doces", emoji: "🍰" }, { nome: "Bebidas geladas", emoji: "🧊" }] },
  { id: "acai", nome: "Açaí / Sorveteria", emoji: "🍧", fonte: "bricolage", raio: 26, frase: "Monte do seu jeito.", categorias: [{ nome: "Açaí", emoji: "🍧" }, { nome: "Sorvetes", emoji: "🍦" }, { nome: "Adicionais", emoji: "🍓" }] },
  { id: "doceria", nome: "Doceria / Confeitaria", emoji: "🧁", fonte: "playfair", raio: 24, frase: "Feito à mão, com açúcar e afeto.", categorias: [{ nome: "Bolos", emoji: "🎂" }, { nome: "Doces", emoji: "🧁" }, { nome: "Tortas", emoji: "🥧" }, { nome: "Bebidas", emoji: "☕" }] },
  { id: "churrascaria", nome: "Churrascaria / Steakhouse", emoji: "🥩", fonte: "anton", raio: 10, frase: "Brasa, sal grosso e tempo.", categorias: [{ nome: "Cortes", emoji: "🥩" }, { nome: "Acompanhamentos", emoji: "🥔" }, { nome: "Bebidas", emoji: "🍷" }] },
  { id: "saudavel", nome: "Saudável / Fit", emoji: "🥗", fonte: "bricolage", raio: 22, frase: "Leve, fresco e cheio de sabor.", categorias: [{ nome: "Bowls", emoji: "🥗" }, { nome: "Wraps", emoji: "🌯" }, { nome: "Sucos", emoji: "🧃" }] },
  { id: "outro", nome: "Outro", emoji: "✨", fonte: "jakarta", raio: 16, frase: "Bem-vindo! Veja nossos produtos em vídeo.", categorias: [{ nome: "Destaques", emoji: "✨" }, { nome: "Produtos", emoji: "🛍️" }] },
]

export const nichoPorId = (id?: string) => NICHOS.find((n) => n.id === id) ?? NICHOS[NICHOS.length - 1]

/** Marca usada quando o estabelecimento ainda não personalizou nada. */
export function brandingPadrao(nome: string, nicho?: string): Branding {
  const n = nichoPorId(nicho)
  return {
    primary: "#E4572E",
    onPrimary: "#FFFFFF",
    accent: "#FFC914",
    bg: "#111014",
    surface: "#1C1B21",
    text: "#F7F5F2",
    muted: "#A8A3AE",
    fontDisplay: n.fonte,
    fontBody: "jakarta",
    radius: n.raio,
    logoText: nome,
    logoMark: nome.trim().charAt(0).toUpperCase() || "★",
    tagline: n.frase,
  }
}
