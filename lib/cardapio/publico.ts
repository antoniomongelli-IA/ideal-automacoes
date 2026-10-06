"use client"
import { SUPABASE_CHAVE, SUPABASE_URL, supabaseConfigurado, supabaseNavegador } from "@/lib/supabase/cliente"

// Tudo o que o cardápio público faz com o banco: curtidas, favoritos, conta do
// cliente final e os eventos que alimentam o painel do estabelecimento.

const ler = (chave: string) => {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}
const gravar = (chave: string, valor: string) => {
  try {
    localStorage.setItem(chave, valor)
  } catch {
    /* navegador sem storage */
  }
}

/** Código anônimo deste aparelho (sem dados pessoais). Conta "pessoas" e guarda curtidas. */
let visitanteMemoria = ""
export function visitante() {
  const salvo = ler("cardapio:visitante")
  if (salvo) return salvo
  visitanteMemoria ||= `v-${crypto.randomUUID()}`
  gravar("cardapio:visitante", visitanteMemoria)
  return visitanteMemoria
}

// ---------------------------------------------------------------- curtidas

export const curtidasSalvas = (slug: string): string[] => {
  try {
    return JSON.parse(ler(`cardapio:curtidas:${slug}`) ?? "[]")
  } catch {
    return []
  }
}
export const salvarCurtidas = (slug: string, ids: string[]) => gravar(`cardapio:curtidas:${slug}`, JSON.stringify(ids))

/** Curte/descurte no banco e devolve o total novo de curtidas do item. */
export async function curtirNoBanco(itemId: string, curtir: boolean): Promise<number | null> {
  if (!supabaseConfigurado) return null
  const { data, error } = await supabaseNavegador().rpc("curtir", { p_item: itemId, p_visitante: visitante(), p_curtir: curtir })
  if (error) {
    console.error("curtir:", error.message)
    return null
  }
  return data as number
}

/** Itens curtidos neste aparelho ou nesta conta (vale entre aparelhos quando há conta). */
export async function favoritosNoBanco(estId: string): Promise<string[] | null> {
  if (!supabaseConfigurado) return null
  const { data, error } = await supabaseNavegador().rpc("meus_favoritos", { p_est: estId, p_visitante: visitante() })
  if (error) return null
  return (data as string[]) ?? []
}

// ---------------------------------------------------------------- conta do cliente final

export interface Cliente {
  id: string
  nome: string
  telefone: string
}

/** Só números, com DDI 55 quando for número brasileiro (10 ou 11 dígitos). */
export function normalizarTelefone(t: string) {
  const d = t.replace(/\D/g, "")
  return d.length === 10 || d.length === 11 ? `55${d}` : d
}

// O login do cliente é telefone + senha. Por baixo, o Supabase usa um e-mail
// técnico montado a partir do telefone (nenhum e-mail é enviado).
const emailDoTelefone = (t: string) => `${normalizarTelefone(t)}@clientes.idealautomacoes.com.br`

const traduzir = (msg: string) => {
  if (/already registered|already exists/i.test(msg)) return "Esse telefone já tem conta. Toque em “Entrar”."
  if (/invalid login credentials/i.test(msg)) return "Telefone ou senha incorretos."
  if (/password should be at least/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres."
  if (/email not confirmed/i.test(msg)) return "Conta criada, mas falta liberar no Supabase (desligar “Confirm email”)."
  return msg
}

export async function clienteAtual(): Promise<Cliente | null> {
  if (!supabaseConfigurado) return null
  const sb = supabaseNavegador()
  const { data } = await sb.auth.getSession()
  const id = data.session?.user.id
  if (!id) return null
  const { data: c } = await sb.from("clientes").select("id, nome, telefone").eq("id", id).maybeSingle()
  return (c as Cliente) ?? null
}

/** De onde veio o cadastro: vai junto para o aviso do webhook (mensagem de boas-vindas). */
export interface ContextoConta {
  /** slug do estabelecimento */
  origem: string
  /** o que a pessoa fez antes de criar a conta */
  acao?: "curtiu" | "compartilhou"
  itemId?: string
  itemNome?: string
}

export async function cadastrarCliente(nome: string, telefone: string, senha: string, ctx?: ContextoConta): Promise<{ cliente?: Cliente; erro?: string }> {
  if (!supabaseConfigurado) return { erro: "Disponível quando o cardápio estiver ligado ao banco." }
  const tel = normalizarTelefone(telefone)
  if (nome.trim().length < 2) return { erro: "Digite seu nome." }
  if (tel.length < 12) return { erro: "Digite o telefone com DDD." }
  const sb = supabaseNavegador()
  const { data, error } = await sb.auth.signUp({
    email: emailDoTelefone(tel),
    password: senha,
    options: {
      data: {
        tipo: "cliente",
        nome: nome.trim(),
        telefone: tel,
        origem: ctx?.origem,
        acao: ctx?.acao,
        item_id: ctx?.itemId,
        item_nome: ctx?.itemNome,
        // links completos, prontos para a mensagem de boas-vindas
        link_cardapio: ctx ? `${location.origin}/cardapio/${ctx.origem}` : undefined,
        link_item: ctx?.itemId ? `${location.origin}/cardapio/${ctx.origem}?item=${ctx.itemId}` : undefined,
      },
    },
  })
  if (error) return { erro: traduzir(error.message) }
  if (!data.session) return { erro: traduzir("email not confirmed") }
  await sb.rpc("vincular_curtidas", { p_visitante: visitante() })
  return { cliente: { id: data.session.user.id, nome: nome.trim(), telefone: tel } }
}

export async function entrarCliente(telefone: string, senha: string): Promise<{ cliente?: Cliente; erro?: string }> {
  if (!supabaseConfigurado) return { erro: "Disponível quando o cardápio estiver ligado ao banco." }
  const sb = supabaseNavegador()
  const { error } = await sb.auth.signInWithPassword({ email: emailDoTelefone(telefone), password: senha })
  if (error) return { erro: traduzir(error.message) }
  await sb.rpc("vincular_curtidas", { p_visitante: visitante() })
  const c = await clienteAtual()
  return c ? { cliente: c } : { erro: "Essa conta não é de cliente." }
}

export async function sairCliente() {
  if (supabaseConfigurado) await supabaseNavegador().auth.signOut()
}

// ---------------------------------------------------------------- eventos para o painel

type TipoEvento = "abriu" | "viu" | "compartilhou" | "detalhes"
let fila: { tipo: TipoEvento; item?: string }[] = []
let estFila = ""
let timer: ReturnType<typeof setTimeout> | undefined

function enviar() {
  timer = undefined
  if (!fila.length || !estFila || !supabaseConfigurado) return
  const lote = fila.slice(0, 50)
  fila = fila.slice(50)
  const url = `${SUPABASE_URL}/rest/v1/rpc/registrar_eventos`
  const chave = SUPABASE_CHAVE
  // keepalive: o envio termina mesmo se a pessoa fechar a página
  fetch(url, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json", apikey: chave, Authorization: `Bearer ${chave}` },
    body: JSON.stringify({ p_est: estFila, p_visitante: visitante(), p_eventos: lote }),
  }).catch(() => {})
  if (fila.length) enviar()
}

/** Registra um evento. Os eventos vão para o banco em lotes (a cada poucos segundos ou ao sair da página). */
export function registrarEvento(estId: string | undefined, tipo: TipoEvento, item?: string) {
  if (!estId || !supabaseConfigurado) return
  if (estFila && estFila !== estId) enviar()
  estFila = estId
  fila.push(item ? { tipo, item } : { tipo })
  timer ??= setTimeout(enviar, 4000)
}

if (typeof window !== "undefined") {
  const sair = () => document.visibilityState === "hidden" && enviar()
  document.addEventListener("visibilitychange", sair)
  window.addEventListener("pagehide", enviar)
}
