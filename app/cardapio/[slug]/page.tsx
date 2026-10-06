import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { getRestaurante, RESTAURANTES } from "@/lib/cardapio/restaurantes"
import { MenuApp } from "@/components/cardapio/MenuApp"
import { DesktopMoldura } from "@/components/cardapio/DesktopMoldura"

export function generateStaticParams() {
  return RESTAURANTES.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: PageProps<"/cardapio/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const r = getRestaurante(slug)
  if (!r) return {}
  return {
    title: `${r.nome} · Cardápio em vídeo`,
    description: r.branding.tagline,
  }
}

export async function generateViewport({ params }: PageProps<"/cardapio/[slug]">): Promise<Viewport> {
  const { slug } = await params
  return { themeColor: getRestaurante(slug)?.branding.bg ?? "#000000" }
}

export default async function CardapioPage({ params, searchParams }: PageProps<"/cardapio/[slug]">) {
  const { slug } = await params
  const sp = await searchParams
  const r = getRestaurante(slug)
  if (!r) notFound()
  const item = typeof sp.item === "string" ? sp.item : undefined

  return (
    <DesktopMoldura restaurante={r}>
      <MenuApp restaurante={r} itemInicial={item} />
    </DesktopMoldura>
  )
}
