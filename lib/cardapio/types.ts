export type FontKey = "anton" | "fraunces" | "shippori" | "bricolage" | "jakarta" | "playfair"

export interface Branding {
  /** Cor principal: botões, preço, aba ativa */
  primary: string
  /** Texto sobre a cor principal */
  onPrimary: string
  /** Cor de destaque: selos, ranking, coroa do item do mês */
  accent: string
  /** Fundo do app (atrás dos vídeos e nas listas) */
  bg: string
  /** Cartões e folhas */
  surface: string
  text: string
  muted: string
  fontDisplay: FontKey
  fontBody: FontKey
  /** Arredondamento dos cartões e botões, em px */
  radius: number
  /** Nome curto exibido no topo */
  logoText: string
  /** Sigla/emoji usado quando não há logo em imagem */
  logoMark: string
  /** Logo em imagem (ex.: "/midia/<slug>/logo.svg"). Se existir, substitui o logoMark. */
  logo?: string
  tagline: string
}

export interface Categoria {
  id: string
  nome: string
  emoji: string
}

export type Tag = "vegetariano" | "picante" | "novo" | "sem-gluten" | "compartilhar" | "alcoolico"

export interface Item {
  id: string
  nome: string
  descricao: string
  preco: number
  precoAntigo?: number
  categoria: string
  /** Nome do arquivo (sem extensão) em public/midia/<slug>/videos e /posters */
  midia: string
  /** Vendas dos últimos 30 dias (relatório do caixa). Alimenta a aba "Mais pedidos". */
  pedidos30d: number
  pedidosMesAnterior: number
  curtidas: number
  tempoPreparo?: string
  serve?: string
  tags?: Tag[]
  /** id de outro item para sugerir junto (upsell) */
  combinaCom?: string
  destaqueDoMes?: boolean
  notaDoChef?: string
}

export interface Restaurante {
  slug: string
  nome: string
  tipo: string
  cidade: string
  endereco: string
  horario: string
  instagram: string
  branding: Branding
  categorias: Categoria[]
  itens: Item[]
}
