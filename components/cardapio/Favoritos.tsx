"use client"
import { useState } from "react"
import { Heart, LogOut, Play } from "lucide-react"
import { supabaseConfigurado } from "@/lib/supabase/cliente"
import { cadastrarCliente, type Cliente, entrarCliente, formatarTelefone } from "@/lib/cardapio/publico"
import { pedirCodigo, redefinirSenha } from "@/lib/cardapio/senha"
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

/** Campo de telefone com +55 fixo: a pessoa digita só DDD e número. */
function CampoTelefone({ valor, mudar }: { valor: string; mudar: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 pl-3.5" style={estiloCampo}>
      <span className="shrink-0 text-[15px] font-semibold opacity-70">🇧🇷 +55</span>
      <input
        id="conta-telefone"
        className="w-full bg-transparent py-3 pr-3.5 text-[15px] outline-none"
        style={{ color: "var(--c-text)" }}
        placeholder="(67) 99999-9999"
        inputMode="tel"
        autoComplete="tel-national"
        value={valor}
        // se a pessoa colar com +55, tira o 55 da parte digitada (ele já está fixo ao lado)
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, "").replace(/^0+/, "")
          mudar(formatarTelefone(d.length > 11 && d.startsWith("55") ? d.slice(2) : d))
        }}
      />
    </div>
  )
}

type Modo = "criar" | "entrar" | "recuperar" | "codigo"

/** Criar conta (nome, telefone, senha), entrar (telefone, senha) ou recuperar a senha pelo WhatsApp. */
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
  const [modo, setModo] = useState<Modo>("criar")
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [codigo, setCodigo] = useState("")
  // já vem marcada; a pessoa pode desmarcar
  const [aceita, setAceita] = useState(true)
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
    setEnviando(true)
    if (modo === "recuperar") {
      const falha = await pedirCodigo(telefone, r.slug)
      setEnviando(false)
      if (falha) return setErro(falha)
      setCodigo("")
      setModo("codigo")
      setInfo("Se esse número tiver conta, o código chega no WhatsApp em instantes.")
      return
    }
    if (modo === "codigo") {
      const falha = await redefinirSenha(telefone, codigo, senha)
      if (falha) {
        setEnviando(false)
        return setErro(falha)
      }
      // senha trocada: já entra na conta
      const res = await entrarCliente(telefone, senha)
      setEnviando(false)
      if (res.erro) return setErro(res.erro)
      if (res.cliente) aoEntrar(res.cliente)
      return
    }
    const res =
      modo === "criar"
        ? await cadastrarCliente(nome, telefone, senha, aceita, { origem: r.slug, acao: motivo?.acao, itemId: motivo?.itemId, itemNome: motivo?.itemNome })
        : await entrarCliente(telefone, senha)
    setEnviando(false)
    if (res.erro) setErro(res.erro)
    else if (res.cliente) aoEntrar(res.cliente)
  }

  const titulo =
    modo === "entrar"
      ? "Entrar"
      : modo === "recuperar" || modo === "codigo"
        ? "Criar uma nova senha"
        : motivo?.itemNome
          ? `Você ${motivo.acao === "curtiu" ? "curtiu" : "compartilhou"} ${motivo.itemNome}! ❤️`
          : "Salve seus favoritos"
  const subtitulo = {
    criar: "Crie sua conta e receba no WhatsApp o link para ver de novo sempre que quiser. Seus favoritos ficam guardados para a próxima visita.",
    entrar: "Use o telefone e a senha da sua conta.",
    recuperar: "Digite o telefone da sua conta. Vamos mandar um código de 6 números no seu WhatsApp.",
    codigo: `Digite o código que chegou no WhatsApp ${telefone ? `do número ${telefone}` : ""} e escolha a nova senha.`,
  }[modo]
  const botaoTexto = { criar: "Criar conta", entrar: "Entrar", recuperar: "Enviar código no WhatsApp", codigo: "Salvar nova senha e entrar" }[modo]

  return (
    <Folha aberta={aberta} fechar={fechar}>
      <h3 className="text-2xl" style={{ fontFamily: "var(--f-display)" }}>
        {titulo}
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--c-muted)" }}>
        {subtitulo}
      </p>
      <form onSubmit={enviar} className="mt-4 space-y-2.5">
        {modo === "criar" && <input id="conta-nome" className={campo} style={estiloCampo} placeholder="Seu nome" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} />}
        {modo !== "codigo" && <CampoTelefone valor={telefone} mudar={setTelefone} />}
        {modo === "codigo" && (
          <input
            id="conta-codigo"
            className={`${campo} text-center text-2xl font-bold tracking-[0.4em]`}
            style={estiloCampo}
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        )}
        {modo !== "recuperar" && (
          <input
            id="conta-senha"
            className={campo}
            style={estiloCampo}
            placeholder={modo === "codigo" ? "Nova senha (mínimo 6 caracteres)" : "Senha (mínimo 6 caracteres)"}
            type="password"
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        )}
        {modo === "criar" && (
          <label className="flex cursor-pointer items-start gap-2.5 px-1 pt-1 text-sm" style={{ color: "var(--c-muted)" }}>
            <input id="conta-aceita" type="checkbox" checked={aceita} onChange={(e) => setAceita(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" style={{ accentColor: "var(--c-primary)" }} />
            <span>Aceito receber mensagens de {r.nome} no WhatsApp</span>
          </label>
        )}
        {info && !erro && <p className="text-sm font-semibold" style={{ color: "var(--c-primary)" }}>{info}</p>}
        {erro && <p className="text-sm font-semibold text-rose-400">{erro}</p>}
        <button disabled={enviando} className="w-full py-3.5 font-bold disabled:opacity-60" style={botao}>
          {enviando ? "Aguarde…" : botaoTexto}
        </button>
      </form>
      <div className="mt-3 flex flex-col items-center gap-2 text-sm" style={{ color: "var(--c-muted)" }}>
        {modo === "criar" && (
          <button onClick={() => trocarModo("entrar")} className="underline">
            Já tenho conta: entrar
          </button>
        )}
        {modo === "entrar" && (
          <>
            <button onClick={() => trocarModo("recuperar")} className="underline">
              Esqueci minha senha
            </button>
            <button onClick={() => trocarModo("criar")} className="underline">
              Não tenho conta: criar
            </button>
          </>
        )}
        {modo === "codigo" && (
          <button onClick={() => trocarModo("recuperar")} className="underline">
            Não recebi o código
          </button>
        )}
        {(modo === "recuperar" || modo === "codigo") && (
          <button onClick={() => trocarModo("entrar")} className="underline">
            Voltar para entrar
          </button>
        )}
      </div>
    </Folha>
  )
}
