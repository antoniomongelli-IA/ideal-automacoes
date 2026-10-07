import { Suspense } from "react"
import type { Metadata } from "next"
import { PainelDono } from "@/components/cardapio/painel/dono/PainelDono"

export const metadata: Metadata = { title: "Painel do estabelecimento" }

export default function PainelPage() {
  // useSearchParams (?novo=1) precisa de Suspense
  return (
    <Suspense>
      <PainelDono />
    </Suspense>
  )
}
