import type { Metadata } from "next"
import { Cadastro } from "@/components/cardapio/cadastro/Cadastro"

export const metadata: Metadata = { title: "Criar cardápio em vídeo" }

export default function CadastroPage() {
  return <Cadastro />
}
