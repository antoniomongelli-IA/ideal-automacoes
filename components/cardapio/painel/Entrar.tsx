"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { supabaseConfigurado } from "@/lib/supabase/cliente"
import { entrarDono } from "@/lib/cardapio/dono"
import { pedirCodigo, redefinirSenha } from "@/lib/cardapio/senha"
import { Campo } from "../marca/EditorMarca"

type Modo = "entrar" | "recuperar" | "codigo"

export function Entrar() {
  const router = useRouter()
  const [modo, setModo] = useState<Modo>("entrar")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [codigo, setCodigo] = useState("")
  const [erro, setErro] = useState("")
  const [info, setInfo] = useState("")
  const [enviando, setEnviando] = useState(false)

  const trocarModo = (m: Modo) => {
    setModo(m)
    setErro("")
    setInfo("")
    setSenha("")
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    if (!supabaseConfigurado) return setErro("O banco ainda não está conectado.")
    setEnviando(true)
    if (modo === "recuperar") {
      const falha = await pedirCodigo(email)
      setEnviando(false)
      if (falha) return setErro(falha)
      setCodigo("")
      setModo("codigo")
      setInfo("Se esse e-mail tiver conta, o código chega no WhatsApp do estabelecimento em instantes.")
      return
    }
    if (modo === "codigo") {
      const falha = await redefinirSenha(email, codigo, senha)
      if (falha) {
        setEnviando(false)
        return setErro(falha)
      }
    }
    // entrar (ou entrar já com a senha nova)
    const falha = await entrarDono(email, senha)
    setEnviando(false)
    if (falha) setErro(falha)
    else router.push("/cardapio/painel")
  }

  const titulo = modo === "entrar" ? "Entrar no painel" : "Criar uma nova senha"
  const subtitulo = {
    entrar: "Adicione itens, fotos e vídeos e veja os resultados do seu cardápio.",
    recuperar: "Digite o e-mail da sua conta. Vamos mandar um código de 6 números no WhatsApp cadastrado do estabelecimento.",
    codigo: "Digite o código que chegou no WhatsApp do estabelecimento e escolha a nova senha.",
  }[modo]
  const botao = { entrar: "Entrar", recuperar: "Enviar código no WhatsApp", codigo: "Salvar nova senha e entrar" }[modo]

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#0c0b10] px-4 text-white">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/[0.07] bg-[#15141a] p-6">
        <div>
          <h1 className="text-2xl font-extrabold">{titulo}</h1>
          <p className="mt-1 text-sm text-white/55">{subtitulo}</p>
        </div>
        {modo !== "codigo" && <Campo id="entrar-email" l="E-mail" tipo="email" v={email} on={setEmail} />}
        {modo === "codigo" && (
          <label className="block" htmlFor="entrar-codigo">
            <span className="mb-1 block text-xs font-semibold text-white/60">Código do WhatsApp</span>
            <input
              id="entrar-codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-center text-2xl font-bold tracking-[0.4em] outline-none placeholder:text-white/20 focus:border-white/40"
            />
          </label>
        )}
        {modo !== "recuperar" && <Campo id="entrar-senha" l={modo === "codigo" ? "Nova senha (mínimo 6 caracteres)" : "Senha"} tipo="password" v={senha} on={setSenha} />}
        {info && !erro && <p className="text-sm font-semibold text-emerald-300">{info}</p>}
        {erro && <p className="text-sm font-semibold text-rose-400">{erro}</p>}
        <button disabled={enviando} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-bold text-black disabled:opacity-60">
          {enviando && <Loader2 className="h-4 w-4 animate-spin" />} {botao}
        </button>
        <div className="flex flex-col items-center gap-2 text-sm text-white/55">
          {modo === "entrar" && (
            <button type="button" onClick={() => trocarModo("recuperar")} className="underline">
              Esqueci minha senha
            </button>
          )}
          {modo === "codigo" && (
            <button type="button" onClick={() => trocarModo("recuperar")} className="underline">
              Não recebi o código
            </button>
          )}
          {modo !== "entrar" && (
            <button type="button" onClick={() => trocarModo("entrar")} className="underline">
              Voltar para entrar
            </button>
          )}
          {modo === "entrar" && (
            <p>
              Ainda não tem cardápio?{" "}
              <Link href="/cardapio/cadastro" className="font-semibold text-white underline">
                Criar agora
              </Link>
            </p>
          )}
        </div>
      </form>
    </main>
  )
}
