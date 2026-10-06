import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRestaurante, RESTAURANTES } from "@/lib/cardapio/data"
import { Painel } from "@/components/cardapio/painel/Painel"

export function generateStaticParams() {
  return RESTAURANTES.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: PageProps<"/cardapio/[slug]/painel">): Promise<Metadata> {
  const { slug } = await params
  const r = getRestaurante(slug)
  return { title: r ? `Painel · ${r.nome}` : "Painel" }
}

export default async function PainelPage({ params }: PageProps<"/cardapio/[slug]/painel">) {
  const { slug } = await params
  const r = getRestaurante(slug)
  if (!r) notFound()
  return <Painel restaurante={r} />
}
