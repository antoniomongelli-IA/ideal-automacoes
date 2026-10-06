import { brandingPadrao } from "./nichos"
import type { Branding, Item, Restaurante } from "./types"

// Conversão entre o formato do banco e o formato que as telas do cardápio usam.

/** Formato devolvido pela função cardapio_publico do banco. */
export interface CardapioBanco {
  id: string
  slug: string
  nome: string
  nicho: string
  cidade: string | null
  endereco: string | null
  horario: string | null
  instagram: string | null
  whatsapp: string | null
  branding: Partial<Branding> | null
  logo_url: string | null
  categorias: { id: string; nome: string; emoji: string }[]
  itens: {
    id: string
    categoria_id: string | null
    nome: string
    descricao: string
    preco: number | string
    preco_antigo: number | string | null
    video_url: string | null
    poster_url: string | null
    foto_url: string | null
    tags: string[]
    serve: string | null
    tempo_preparo: string | null
    destaque_mes: boolean
    nota_chef: string | null
    combina_com: string | null
    pedidos_mes: number
    pedidos_mes_anterior: number
    curtidas: number
    vistos_30d: number
  }[]
}

const SEM_CATEGORIA = "sem-categoria"

/** Converte o cardápio do banco para o formato que as telas usam. */
export function deBanco(c: CardapioBanco): Restaurante {
  const branding: Branding = { ...brandingPadrao(c.nome, c.nicho), ...(c.branding ?? {}) }
  if (c.logo_url) branding.logo = c.logo_url
  const itens: Item[] = c.itens.map((i) => ({
    id: i.id,
    nome: i.nome,
    descricao: i.descricao,
    preco: Number(i.preco),
    precoAntigo: i.preco_antigo != null ? Number(i.preco_antigo) : undefined,
    categoria: i.categoria_id ?? SEM_CATEGORIA,
    video: i.video_url ?? undefined,
    poster: i.poster_url ?? undefined,
    foto: i.foto_url ?? undefined,
    tags: i.tags ?? [],
    serve: i.serve ?? undefined,
    tempoPreparo: i.tempo_preparo ?? undefined,
    destaqueDoMes: i.destaque_mes,
    notaDoChef: i.nota_chef ?? undefined,
    combinaCom: i.combina_com ?? undefined,
    pedidos30d: i.pedidos_mes,
    pedidosMesAnterior: i.pedidos_mes_anterior,
    curtidas: Number(i.curtidas) || 0,
    vistos30d: Number(i.vistos_30d) || 0,
  }))
  const categorias = c.categorias.map((k) => ({ id: k.id, nome: k.nome, emoji: k.emoji }))
  if (itens.some((i) => i.categoria === SEM_CATEGORIA)) categorias.push({ id: SEM_CATEGORIA, nome: "Outros", emoji: "✨" })
  return {
    id: c.id,
    slug: c.slug,
    nome: c.nome,
    nicho: c.nicho,
    tipo: c.nicho,
    cidade: c.cidade ?? "",
    endereco: c.endereco ?? "",
    horario: c.horario ?? "",
    instagram: c.instagram ?? "",
    whatsapp: c.whatsapp ?? undefined,
    fonte: "banco",
    branding,
    categorias,
    itens,
  }
}


/** Linha da tabela "itens" (usada no painel). */
export type ItemBanco = Omit<CardapioBanco["itens"][number], "curtidas" | "vistos_30d"> & {
  ativo: boolean
  ordem: number
  curtidas?: number
  vistos_30d?: number
}
export type CategoriaBanco = { id: string; nome: string; emoji: string; ordem: number }

/** Monta o cardápio a partir das tabelas (prévia do painel, que também mostra itens desativados). */
export function paraRestaurante(
  est: Omit<CardapioBanco, "categorias" | "itens">,
  categorias: CategoriaBanco[],
  itens: ItemBanco[],
): Restaurante {
  const ativos = itens.filter((i) => i.ativo).map((i) => ({ ...i, curtidas: i.curtidas ?? 0, vistos_30d: i.vistos_30d ?? 0 }))
  return deBanco({ ...est, categorias, itens: ativos })
}
