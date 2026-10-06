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

/** Etiqueta do item. As conhecidas estão em TAGS (utils); qualquer outro texto vira etiqueta livre. */
export type Tag = string

export interface Item {
  id: string
  nome: string
  descricao: string
  preco: number
  precoAntigo?: number
  categoria: string
  /** Demo: nome do arquivo em public/midia/<slug>/. No banco, fica vazio e valem video/poster/foto. */
  midia?: string
  /** Endereço do vídeo vertical (opcional) */
  video?: string
  /** Capa do vídeo */
  poster?: string
  /** Foto, usada quando não há vídeo */
  foto?: string
  /** Vendas dos últimos 30 dias (relatório do caixa). Alimenta a aba "Mais pedidos". */
  pedidos30d: number
  pedidosMesAnterior: number
  curtidas: number
  /** Vídeo assistido nos últimos 30 dias (do banco). Ranqueia quando não há vendas informadas. */
  vistos30d?: number
  tempoPreparo?: string
  serve?: string
  tags?: Tag[]
  /** id de outro item para sugerir junto (upsell) */
  combinaCom?: string
  destaqueDoMes?: boolean
  notaDoChef?: string
}

export interface Restaurante {
  /** id no banco (vazio nos restaurantes de demonstração) */
  id?: string
  slug: string
  nome: string
  tipo: string
  cidade: string
  endereco: string
  horario: string
  instagram: string
  whatsapp?: string
  nicho?: string
  /** "banco" = Supabase; "demo" = arquivos do projeto */
  fonte?: "banco" | "demo"
  branding: Branding
  categorias: Categoria[]
  itens: Item[]
}
