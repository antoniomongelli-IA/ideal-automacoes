"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { supabaseConfigurado } from "@/lib/supabase/cliente"
import { entrarDono } from "@/lib/cardapio/dono"
import { Campo } from "../marca/EditorMarca"

export function Entrar() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabaseConfigurado) return setErro("O banco ainda não está conectado.")
    setEnviando(true)
    const falha = await entrarDono(email, senha)
    setEnviando(false)
    if (falha) setErro(falha)
    else router.push("/cardapio/painel")
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#0c0b10] px-4 text-white">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/[0.07] bg-[#15141a] p-6">
        <div>
          <h1 className="text-2xl font-extrabold">Entrar no painel</h1>
          <p className="mt-1 text-sm text-white/55">Adicione itens, fotos e vídeos e veja os resultados do seu cardápio.</p>
        </div>
        <Campo id="entrar-email" l="E-mail" tipo="email" v={email} on={setEmail} />
        <Campo id="entrar-senha" l="Senha" tipo="password" v={senha} on={setSenha} />
        {erro && <p className="text-sm font-semibold text-rose-400">{erro}</p>}
        <button disabled={enviando} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-bold text-black disabled:opacity-60">
          {enviando && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
        </button>
        <p className="text-center text-sm text-white/55">
          Ainda não tem cardápio?{" "}
          <Link href="/cardapio/cadastro" className="font-semibold text-white underline">
            Criar agora
          </Link>
        </p>
      </form>
    </main>
  )
}
