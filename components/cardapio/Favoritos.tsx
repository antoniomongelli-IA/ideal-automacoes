"use client"
import { useState } from "react"
import { Heart, LogOut, Play } from "lucide-react"
import { supabaseConfigurado } from "@/lib/supabase/cliente"
import { cadastrarCliente, type Cliente, entrarCliente } from "@/lib/cardapio/publico"
import { brl } from "@/lib/cardapio/utils"
import { Capa, Folha, useMenu } from "./ui"

const campo = "w-full px-3.5 py-3 text-[15px] outline-none"
const estiloCampo = { background: "color-mix(in srgb, var(--c-text) 7%, transparent)", borderRadius: "var(--radius)", color: "var(--c-text)" }
const botao = { background: "var(--c-primary)", color: "var(--c-on-primary)", borderRadius: "var(--radius)" }

/** Lista do que a pessoa curtiu neste estabelecimento. */
export function FolhaFavoritos({ aberta, fechar, cliente, abrirConta, sair }: { aberta: boolean; fechar: () => void; cliente: Cliente | null; abrirConta: () => void; sair: () => void }) {
  const { r, curtidos, abrirNoFeed } = useMenu()
  const itens = r.itens.filter((i) => curtidos.has(i.id))
  const ids = itens.map((i) => i.id)

  return (
    <Folha aberta={aberta} fechar={fechar}>
      <h3 className="flex items-center gap-2 text-2xl" style={{ fontFamily: "var(--f-display)" }}>
        <Heart className="h-6 w-6" fill="var(--c-primary)" stroke="var(--c-primary)" /> Meus favoritos
      </h3>
      {cliente ? (
        <div className="mt-1 flex items-center justify-between text-sm" style={{ color: "var(--c-muted)" }}>
          <span>Olá, {cliente.nome.split(" ")[0]}! Seus favoritos ficam salvos na sua conta.</span>
          <button onClick={sair} className="inline-flex items-center gap-1 text-xs underline">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      ) : (
        <p className="mt-1 text-sm" style={{ color: "var(--c-muted)" }}>
          Toque duas vezes num vídeo ou no ❤️ para guardar aqui.
        </p>
      )}

      <div className="mt-4 space-y-2.5">
        {itens.map((it) => (
          <button
            key={it.id}
            onClick={() => {
              fechar()
              abrirNoFeed(it.id, ids)
            }}
            className="flex w-full items-center gap-3 p-2 text-left"
            style={{ background: "color-mix(in srgb, var(--c-text) 6%, transparent)", borderRadius: "var(--radius)" }}
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden" style={{ borderRadius: "calc(var(--radius) * 0.75)" }}>
              <Capa item={it} sizes="56px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{it.nome}</span>
              <span className="text-sm font-bold">{brl(it.preco)}</span>
            </span>
            <Play className="h-5 w-5 opacity-60" />
          </button>
        ))}
        {itens.length === 0 && <p className="py-6 text-center text-sm" style={{ color: "var(--c-muted)" }}>Nada por aqui ainda.</p>}
      </div>

      {!cliente && supabaseConfigurado && (
        <div className="mt-5 p-4" style={{ background: "color-mix(in srgb, var(--c-primary) 14%, transparent)", borderRadius: "var(--radius)" }}>
          <p className="font-semibold">Não perca seus favoritos</p>
          <p className="mt-1 text-sm" style={{ color: "var(--c-muted)" }}>
            Crie sua conta com nome e telefone para ver o que curtiu em qualquer celular, na próxima visita.
          </p>
          <button onClick={abrirConta} className="mt-3 w-full py-3 font-bold" style={botao}>
            Criar conta ou entrar
          </button>
        </div>
      )}
    </Folha>
  )
}

/** Criar conta (nome, telefone, senha) ou entrar (telefone, senha). */
export function FolhaConta({
  aberta,
  fechar,
  aoEntrar,
  motivo,
}: {
  aberta: boolean
  fechar: () => void
  aoEntrar: (c: Cliente) => void
  motivo?: { acao: "curtiu" | "compartilhou"; itemId: string; itemNome?: string } | null
}) {
  const { r } = useMenu()
  const [modo, setModo] = useState<"criar" | "entrar">("criar")
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setEnviando(true)
    const res = modo === "criar" ? await cadastrarCliente(nome, telefone, senha, { origem: r.slug, acao: motivo?.acao, itemId: motivo?.itemId, itemNome: motivo?.itemNome }) : await entrarCliente(telefone, senha)
    setEnviando(false)
    if (res.erro) setErro(res.erro)
    else if (res.cliente) aoEntrar(res.cliente)
  }

  return (
    <Folha aberta={aberta} fechar={fechar}>
      <h3 className="text-2xl" style={{ fontFamily: "var(--f-display)" }}>
        {modo === "entrar" ? "Entrar" : motivo?.itemNome ? `Você ${motivo.acao === "curtiu" ? "curtiu" : "compartilhou"} ${motivo.itemNome}! ❤️` : "Salve seus favoritos"}
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--c-muted)" }}>
        {modo === "criar"
          ? "Crie sua conta e receba no WhatsApp o link para ver de novo sempre que quiser. Seus favoritos ficam guardados para a próxima visita."
          : "Use o telefone e a senha da sua conta."}
      </p>
      <form onSubmit={enviar} className="mt-4 space-y-2.5">
        {modo === "criar" && <input id="conta-nome" className={campo} style={estiloCampo} placeholder="Seu nome" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} />}
        <input id="conta-telefone" className={campo} style={estiloCampo} placeholder="Telefone com DDD" inputMode="tel" autoComplete="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <input
          id="conta-senha"
          className={campo}
          style={estiloCampo}
          placeholder="Senha (mínimo 6 caracteres)"
          type="password"
          autoComplete={modo === "criar" ? "new-password" : "current-password"}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        {erro && <p className="text-sm font-semibold text-rose-400">{erro}</p>}
        <button disabled={enviando} className="w-full py-3.5 font-bold disabled:opacity-60" style={botao}>
          {enviando ? "Aguarde…" : modo === "criar" ? "Criar conta" : "Entrar"}
        </button>
      </form>
      <button onClick={() => setModo(modo === "criar" ? "entrar" : "criar")} className="mt-3 w-full text-center text-sm underline" style={{ color: "var(--c-muted)" }}>
        {modo === "criar" ? "Já tenho conta: entrar" : "Não tenho conta: criar"}
      </button>
    </Folha>
  )
}
