"use client"
import { useEffect, useState } from "react"
import { Clock, Pencil, Plus, Power, Trash2, X } from "lucide-react"
import { supabaseNavegador } from "@/lib/supabase/cliente"
import { dePromocaoBanco, type ItemBanco, type PromocaoBanco } from "@/lib/cardapio/mapear"
import { brl, DIAS_SEMANA, promoNoAr, promoQuando } from "@/lib/cardapio/utils"
import { Campo } from "../../marca/EditorMarca"

const card = "rounded-2xl border border-white/[0.07] bg-[#15141a]"
const numero = (v: string) => Number(v.replace(/\./g, "").replace(",", ".")) || 0

type Form = {
  id?: string
  titulo: string
  descricao: string
  item_id: string
  preco_promo: string
  dias: number[]
  diaTodo: boolean
  hora_inicio: string
  hora_fim: string
  ativo: boolean
}

const novo = (): Form => ({ titulo: "", descricao: "", item_id: "", preco_promo: "", dias: [1, 2, 3, 4, 5], diaTodo: false, hora_inicio: "18:00", hora_fim: "20:00", ativo: true })

const ATALHOS: { l: string; dias: number[] }[] = [
  { l: "Todos os dias", dias: [0, 1, 2, 3, 4, 5, 6] },
  { l: "Seg a Sex", dias: [1, 2, 3, 4, 5] },
  { l: "Fim de semana", dias: [0, 6] },
]

/** Promoções com dia e horário: aparecem sozinhas no cardápio só no horário marcado. */
export function AbaPromocoes({
  estId,
  promocoes,
  mudarPromocoes,
  itens,
  avisar,
}: {
  estId: string
  promocoes: PromocaoBanco[]
  mudarPromocoes: (f: (l: PromocaoBanco[]) => PromocaoBanco[]) => void
  itens: ItemBanco[]
  avisar: (m: string) => void
}) {
  const [form, setForm] = useState<Form | null>(null)
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)
  // relógio para mostrar o que está no ar agora (só no navegador)
  const [agora, setAgora] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => setAgora(new Date())
    const primeira = setTimeout(tick, 0)
    const t = setInterval(tick, 30_000)
    return () => {
      clearTimeout(primeira)
      clearInterval(t)
    }
  }, [])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))
  const nomeItem = (id: string | null) => itens.find((i) => i.id === id)

  const editar = (p: PromocaoBanco) => {
    setErro("")
    const inicio = p.hora_inicio.slice(0, 5)
    const fim = p.hora_fim.slice(0, 5)
    setForm({
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao ?? "",
      item_id: p.item_id ?? "",
      preco_promo: p.preco_promo != null ? String(p.preco_promo).replace(".", ",") : "",
      dias: p.dias,
      diaTodo: inicio === fim,
      hora_inicio: inicio === fim ? "18:00" : inicio,
      hora_fim: inicio === fim ? "20:00" : fim,
      ativo: p.ativo !== false,
    })
  }

  const salvar = async () => {
    if (!form) return
    setErro("")
    if (form.titulo.trim().length < 2) return setErro("Dê um nome à promoção (ex.: Happy hour).")
    if (!form.dias.length) return setErro("Escolha pelo menos um dia da semana.")
    if (!form.diaTodo && form.hora_inicio === form.hora_fim) return setErro("O horário de início e de fim estão iguais. Marque “O dia todo” ou ajuste o horário.")
    const item = nomeItem(form.item_id)
    const preco = form.item_id && form.preco_promo ? numero(form.preco_promo) : null
    if (item && preco !== null && preco >= Number(item.preco)) return setErro(`O preço da promoção precisa ser menor que o preço normal (${brl(Number(item.preco))}).`)
    const linha = {
      estabelecimento_id: estId,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      item_id: form.item_id || null,
      preco_promo: preco,
      dias: [...form.dias].sort(),
      hora_inicio: form.diaTodo ? "00:00" : form.hora_inicio,
      hora_fim: form.diaTodo ? "00:00" : form.hora_fim,
      ativo: form.ativo,
    }
    setSalvando(true)
    const sb = supabaseNavegador()
    const { data, error } = form.id ? await sb.from("promocoes").update(linha).eq("id", form.id).select().single() : await sb.from("promocoes").insert(linha).select().single()
    setSalvando(false)
    if (error || !data) return setErro(error?.message ?? "Não foi possível salvar")
    const salvo = data as PromocaoBanco
    mudarPromocoes((l) => (l.some((p) => p.id === salvo.id) ? l.map((p) => (p.id === salvo.id ? salvo : p)) : [...l, salvo]))
    setForm(null)
    avisar("Promoção salva")
  }

  const ligar = async (p: PromocaoBanco) => {
    const ativo = p.ativo === false
    mudarPromocoes((l) => l.map((x) => (x.id === p.id ? { ...x, ativo } : x)))
    const { error } = await supabaseNavegador().from("promocoes").update({ ativo }).eq("id", p.id)
    if (error) avisar(`Erro: ${error.message}`)
    else avisar(ativo ? "Promoção ligada" : "Promoção desligada")
  }

  const apagar = async (p: PromocaoBanco) => {
    if (!window.confirm(`Apagar a promoção "${p.titulo}"?`)) return
    const { error } = await supabaseNavegador().from("promocoes").delete().eq("id", p.id)
    if (error) return avisar(`Erro: ${error.message}`)
    mudarPromocoes((l) => l.filter((x) => x.id !== p.id))
    avisar("Promoção apagada")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-xl text-sm text-white/60">
          A promoção aparece sozinha no cardápio só nos dias e horários marcados: um aviso no topo e o preço promocional no item. Fora do horário, o preço volta ao normal.
        </p>
        <button
          onClick={() => {
            setErro("")
            setForm(novo())
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black"
        >
          <Plus className="h-4 w-4" /> Nova promoção
        </button>
      </div>

      {promocoes.length === 0 && (
        <div className={`${card} p-5 text-sm text-white/60`}>
          Nenhuma promoção ainda. Exemplos: <b className="text-white/80">Happy hour</b> (chopp mais barato de seg a sex, das 18h às 20h), <b className="text-white/80">Prato do dia</b> (às quartas, o dia todo).
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {promocoes.map((p) => {
          const promo = dePromocaoBanco(p)
          const it = nomeItem(p.item_id)
          const desligada = p.ativo === false
          const noAr = !desligada && agora ? promoNoAr(promo, agora) : false
          return (
            <div key={p.id} className={`${card} p-4 ${desligada ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-bold">🔥 {p.titulo}</div>
                  {p.descricao && <div className="text-sm text-white/55">{p.descricao}</div>}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${desligada ? "bg-white/10 text-white/60" : noAr ? "bg-emerald-400 text-black" : "bg-white/10 text-white/70"}`}>
                  {desligada ? "Desligada" : noAr ? "No ar agora" : "Fora do horário"}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-white/70">
                <Clock className="h-4 w-4" /> {promoQuando(promo)}
              </div>
              {it && (
                <div className="mt-1 text-sm text-white/70">
                  {it.nome}
                  {promo.precoPromo !== undefined && (
                    <>
                      : <span className="line-through opacity-60">{brl(Number(it.preco))}</span> <b className="text-white">{brl(promo.precoPromo)}</b>
                    </>
                  )}
                  {!it.ativo && <span className="ml-1 text-amber-300">(item pausado: a promoção não aparece)</span>}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => ligar(p)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-sm">
                  <Power className="h-4 w-4" /> {desligada ? "Ligar" : "Desligar"}
                </button>
                <button onClick={() => editar(p)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-sm">
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button onClick={() => apagar(p)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/60 hover:bg-white/5">
                  <Trash2 className="h-4 w-4" /> Apagar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal>
          <div className="flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden bg-[#15141a] text-white md:max-h-[92dvh] md:rounded-2xl md:border md:border-white/10">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <h2 className="text-lg font-bold">{form.id ? "Editar promoção" : "Nova promoção"}</h2>
              <button onClick={() => setForm(null)} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <Campo id="promo-titulo" l="Nome da promoção" v={form.titulo} on={(v) => set("titulo", v)} placeholder="Ex.: Happy hour" />
              <Campo id="promo-desc" l="Descrição (opcional)" v={form.descricao} on={(v) => set("descricao", v)} placeholder="Ex.: Chopp em dobro" />
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <label className="block" htmlFor="promo-item">
                  <span className="mb-1 block text-xs font-semibold text-white/60">Item em promoção (opcional)</span>
                  <select
                    id="promo-item"
                    value={form.item_id}
                    onChange={(e) => set("item_id", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#1b1a21] px-3 py-2.5 text-[15px] outline-none"
                  >
                    <option value="">Nenhum (só o aviso no topo)</option>
                    {itens.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nome} · {brl(Number(i.preco))}
                      </option>
                    ))}
                  </select>
                </label>
                {form.item_id && <Campo id="promo-preco" l="Preço na promoção" v={form.preco_promo} on={(v) => set("preco_promo", v)} placeholder="12,90" />}
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold text-white/60">Dias da semana</div>
                <div className="flex flex-wrap gap-1.5">
                  {DIAS_SEMANA.map((d, i) => {
                    const on = form.dias.includes(i)
                    return (
                      <button
                        key={d}
                        onClick={() => set("dias", on ? form.dias.filter((x) => x !== i) : [...form.dias, i])}
                        className={`w-12 rounded-full border py-1.5 text-sm ${on ? "border-white bg-white font-semibold text-black" : "border-white/15 hover:bg-white/5"}`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/55">
                  {ATALHOS.map((a) => (
                    <button key={a.l} onClick={() => set("dias", a.dias)} className="underline">
                      {a.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input id="promo-dia-todo" type="checkbox" checked={form.diaTodo} onChange={(e) => set("diaTodo", e.target.checked)} className="h-5 w-5" />
                  O dia todo
                </label>
                {!form.diaTodo && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block" htmlFor="promo-inicio">
                      <span className="mb-1 block text-xs font-semibold text-white/60">Começa às</span>
                      <input id="promo-inicio" type="time" value={form.hora_inicio} onChange={(e) => set("hora_inicio", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[15px] outline-none [color-scheme:dark]" />
                    </label>
                    <label className="block" htmlFor="promo-fim">
                      <span className="mb-1 block text-xs font-semibold text-white/60">Termina às</span>
                      <input id="promo-fim" type="time" value={form.hora_fim} onChange={(e) => set("hora_fim", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[15px] outline-none [color-scheme:dark]" />
                    </label>
                    {form.hora_fim < form.hora_inicio && <p className="col-span-2 text-xs text-white/50">Termina depois da meia-noite (no dia seguinte).</p>}
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input id="promo-ativa" type="checkbox" checked={form.ativo} onChange={(e) => set("ativo", e.target.checked)} className="h-5 w-5" />
                Promoção ligada
              </label>
            </div>
            <div className="flex items-center gap-3 border-t border-white/[0.07] px-5 py-4">
              {erro && <p className="flex-1 text-sm font-semibold text-rose-400">{erro}</p>}
              <button onClick={() => setForm(null)} className="ml-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5">
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50">
                {form.id ? "Salvar" : "Criar promoção"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
