import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { carregarRestaurante } from "@/lib/cardapio/repo"
import { capaDe } from "@/lib/cardapio/utils"
import { MenuApp } from "@/components/cardapio/MenuApp"
import { DesktopMoldura } from "@/components/cardapio/DesktopMoldura"

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined)

// Endereço público do site, para as prévias de link (WhatsApp, Instagram...) acharem as imagens.
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export async function generateMetadata({ params, searchParams }: PageProps<"/cardapio/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const r = await carregarRestaurante(slug)
  if (!r) return {}
  const itemId = texto((await searchParams).item)
  const item = itemId ? r.itens.find((i) => i.id === itemId) : undefined
  // link de um prato: a prévia mostra o prato; senão, o estabelecimento
  const titulo = item ? `${item.nome} · ${r.nome}` : `${r.nome} · Cardápio em vídeo`
  const descricao = item ? item.descricao || r.branding.tagline : r.branding.tagline
  const imagem = item ? capaDe(item) : r.branding.logo || capaDe(r.itens[0] ?? {})
  return {
    metadataBase: new URL(BASE),
    title: titulo,
    description: descricao,
    openGraph: { title: titulo, description: descricao, type: "website", ...(imagem ? { images: [{ url: imagem }] } : {}) },
  }
}

export async function generateViewport({ params }: PageProps<"/cardapio/[slug]">): Promise<Viewport> {
  const { slug } = await params
  const r = await carregarRestaurante(slug)
  return { themeColor: r?.branding.bg ?? "#000000" }
}

export default async function CardapioPage({ params, searchParams }: PageProps<"/cardapio/[slug]">) {
  const { slug } = await params
  const r = await carregarRestaurante(slug)
  if (!r) notFound()
  const item = texto((await searchParams).item)

  return (
    <DesktopMoldura restaurante={r}>
      <MenuApp restaurante={r} itemInicial={item} />
    </DesktopMoldura>
  )
}
