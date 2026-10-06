"use client"
import { useState } from "react"
import { Crown, Film, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react"
import { supabaseNavegador } from "@/lib/supabase/cliente"
import type { CategoriaBanco, ItemBanco } from "@/lib/cardapio/mapear"
import { tagInfo, TAGS_PAINEL } from "@/lib/cardapio/utils"
import { apagarArquivo, comprimirFoto, enviarArquivo, type InfoVideo, lerVideo, LIMITE_VIDEO_MB, mb } from "@/lib/cardapio/uploads"
import { Campo } from "../../marca/EditorMarca"

const SERVE = ["1 pessoa", "2 pessoas", "3 a 4 pessoas", "Família"]

type Form = Omit<ItemBanco, "id" | "preco" | "preco_antigo" | "pedidos_mes" | "pedidos_mes_anterior"> & {
  id?: string
  preco: string
  preco_antigo: string
  pedidos_mes: string
  pedidos_mes_anterior: string
}

const numero = (v: string) => Number(v.replace(/\./g, "").replace(",", ".")) || 0
const texto = (n: number | string | null | undefined) => (n === null || n === undefined || n === "" || Number(n) === 0 ? "" : String(n).replace(".", ","))

function vazio(categoria: string | null): Form {
  return {
    categoria_id: categoria,
    nome: "",
    descricao: "",
    preco: "",
    preco_antigo: "",
    video_url: null,
    poster_url: null,
    foto_url: null,
    tags: [],
    serve: null,
    tempo_preparo: null,
    destaque_mes: false,
    nota_chef: null,
    combina_com: null,
    pedidos_mes: "",
    pedidos_mes_anterior: "",
    ativo: true,
    ordem: 0,
  }
}

export function EditorItem({
  estId,
  item,
  categorias,
  itens,
  categoriaInicial,
  aoSalvar,
  aoFechar,
}: {
  estId: string
  item?: ItemBanco
  categorias: CategoriaBanco[]
  itens: ItemBanco[]
  categoriaInicial?: string | null
  aoSalvar: (i: ItemBanco) => void
  aoFechar: () => void
}) {
  const [f, setF] = useState<Form>(() =>
    item
      ? { ...item, preco: texto(item.preco), preco_antigo: texto(item.preco_antigo), pedidos_mes: texto(item.pedidos_mes), pedidos_mes_anterior: texto(item.pedidos_mes_anterior) }
      : vazio(categoriaInicial ?? categorias[0]?.id ?? null),
  )
  const [enviando, setEnviando] = useState("")
  // progresso do envio do vídeo: bytes enviados, total e hora de início (para estimar o tempo)
  const [progresso, setProgresso] = useState<{ enviado: number; total: number; inicio: number; agora: number } | null>(null)
  const [erro, setErro] = useState("")
  const [aviso, setAviso] = useState("")
  const [novaTag, setNovaTag] = useState("")
  // arquivos enviados nesta edição (apagados se cancelar) e substituídos (apagados ao salvar)
  const [novos, setNovos] = useState<string[]>([])
  const [trocados, setTrocados] = useState<string[]>([])
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }))

  const trocar = (urlsAntigas: (string | null)[], urlsNovas: string[]) => {
    setTrocados((t) => [...t, ...(urlsAntigas.filter(Boolean) as string[])])
    setNovos((n) => [...n, ...urlsNovas])
  }

  const enviarFoto = async (arq?: File) => {
    if (!arq) return
    setErro("")
    setEnviando("Enviando a foto…")
    try {
      const url = await enviarArquivo(estId, "fotos", await comprimirFoto(arq))
      trocar([f.foto_url], [url])
      set("foto_url", url)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar a foto")
    }
    setEnviando("")
  }

  const enviarVideo = async (arq?: File) => {
    if (!arq) return
    setErro("")
    setAviso("")
    if (arq.size > LIMITE_VIDEO_MB * 1024 * 1024)
      return setErro(`Este vídeo tem ${mb(arq.size)} e o limite é ${LIMITE_VIDEO_MB} MB. Grave em 1080p a 30 fps (não em 4K) e com 6 a 20 segundos.`)
    setEnviando("Lendo o vídeo…")
    let info: InfoVideo | null = null
    try {
      info = await lerVideo(arq)
    } catch (e) {
      // segue sem capa: o vídeo ainda pode tocar nos celulares
      setAviso(e instanceof Error ? e.message : "Não consegui gerar a capa do vídeo.")
    }
    const dicas = []
    if (arq.size > 25 * 1024 * 1024) dicas.push(`O vídeo tem ${mb(arq.size)}: grave em 1080p a 30 fps para enviar bem mais rápido.`)
    if (info && info.duracao > 30) dicas.push("Vídeos de 6 a 20 segundos prendem mais a atenção.")
    if (info && info.largura > info.altura) dicas.push("Grave com o celular em pé (vertical): vídeos deitados aparecem cortados.")
    if (dicas.length) setAviso(dicas.join(" "))
    try {
      setEnviando("Enviando o vídeo…")
      setProgresso({ enviado: 0, total: arq.size, inicio: Date.now(), agora: Date.now() })
      const [video, capa] = await Promise.all([
        enviarArquivo(estId, "videos", arq, arq.name, (enviado, total) => setProgresso((p) => ({ enviado, total, inicio: p?.inicio ?? Date.now(), agora: Date.now() }))),
        info ? enviarArquivo(estId, "capas", info.capa) : Promise.resolve(null),
      ])
      trocar([f.video_url, f.poster_url], capa ? [video, capa] : [video])
      setF((x) => ({ ...x, video_url: video, poster_url: capa }))
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar o vídeo")
    }
    setProgresso(null)
    setEnviando("")
  }

  const alternarTag = (t: string) => set("tags", f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t])

  const salvar = async () => {
    setErro("")
    if (f.nome.trim().length < 2) return setErro("Dê um nome ao item.")
    const linha = {
      estabelecimento_id: estId,
      categoria_id: f.categoria_id,
      nome: f.nome.trim(),
      descricao: f.descricao.trim(),
      preco: numero(f.preco),
      preco_antigo: f.preco_antigo ? numero(f.preco_antigo) : null,
      video_url: f.video_url,
      poster_url: f.poster_url,
      foto_url: f.foto_url,
      tags: f.tags,
      serve: f.serve || null,
      tempo_preparo: f.tempo_preparo || null,
      destaque_mes: f.destaque_mes,
      nota_chef: f.destaque_mes ? f.nota_chef || null : null,
      combina_com: f.combina_com || null,
      pedidos_mes: Math.round(numero(f.pedidos_mes)),
      pedidos_mes_anterior: Math.round(numero(f.pedidos_mes_anterior)),
      ativo: f.ativo,
      ordem: item ? f.ordem : Math.max(-1, ...itens.map((i) => i.ordem)) + 1,
    }
    setEnviando("Salvando…")
    const sb = supabaseNavegador()
    const { data, error } = item ? await sb.from("itens").update(linha).eq("id", item.id).select().single() : await sb.from("itens").insert(linha).select().single()
    setEnviando("")
    if (error || !data) return setErro(error?.message ?? "Não foi possível salvar")
    await Promise.all(trocados.map(apagarArquivo))
    aoSalvar(data as ItemBanco)
  }

  const cancelar = async () => {
    aoFechar()
    await Promise.all(novos.map(apagarArquivo))
  }

  const capa = f.poster_url || f.foto_url

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal>
      <div className="flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden bg-[#15141a] text-white md:max-h-[92dvh] md:rounded-2xl md:border md:border-white/10">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <h2 className="text-lg font-bold">{item ? "Editar item" : "Novo item"}</h2>
          <button onClick={cancelar} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* mídia */}
          <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
            <div className="relative aspect-[9/16] w-[150px] overflow-hidden rounded-xl bg-white/[0.05]">
              {capa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={capa} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full place-items-center px-3 text-center text-xs text-white/40">Sem foto ou vídeo ainda</span>
              )}
              {f.video_url && <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold">▶ vídeo</span>}
            </div>
            <div className="space-y-2.5">
              <p className="text-sm text-white/60">
                Vídeo vertical de 6 a 20 segundos, sem áudio. Sem vídeo, a foto aparece com um zoom suave. Até {LIMITE_VIDEO_MB} MB.
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-black">
                  <Film className="h-4 w-4" /> {f.video_url ? "Trocar vídeo" : "Enviar vídeo"}
                  <input id="item-video" type="file" accept="video/mp4,video/quicktime,video/webm" className="sr-only" disabled={!!enviando} onChange={(e) => enviarVideo(e.target.files?.[0])} />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-3.5 py-2 text-sm font-semibold">
                  <ImagePlus className="h-4 w-4" /> {f.foto_url ? "Trocar foto" : "Enviar foto"}
                  <input id="item-foto" type="file" accept="image/*" className="sr-only" disabled={!!enviando} onChange={(e) => enviarFoto(e.target.files?.[0])} />
                </label>
                {(f.video_url || f.foto_url) && (
                  <button
                    onClick={() => {
                      trocar([f.video_url, f.poster_url, f.foto_url], [])
                      setF((x) => ({ ...x, video_url: null, poster_url: null, foto_url: null }))
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5"
                  >
                    <Trash2 className="h-4 w-4" /> Remover mídia
                  </button>
                )}
              </div>
              {enviando && (
                <p className="flex items-center gap-2 text-sm text-white/70">
                  <Loader2 className="h-4 w-4 animate-spin" /> {enviando}
                </p>
              )}
              {progresso && <BarraProgresso {...progresso} />}
              {aviso && <p className="text-sm text-amber-200">{aviso}</p>}
            </div>
          </div>

          <Campo id="item-nome" l="Nome" v={f.nome} on={(v) => set("nome", v)} placeholder="Ex.: X-Bacon Duplo" />
          <label className="block" htmlFor="item-desc">
            <span className="mb-1 block text-xs font-semibold text-white/60">Descrição</span>
            <textarea
              id="item-desc"
              rows={3}
              value={f.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Ingredientes, modo de preparo, o que deixa ele especial…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[15px] outline-none placeholder:text-white/25 focus:border-white/40"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo id="item-preco" l="Preço (R$)" v={f.preco} on={(v) => set("preco", v)} placeholder="39,90" />
            <Campo id="item-preco-antigo" l="Preço antigo (promoção)" v={f.preco_antigo} on={(v) => set("preco_antigo", v)} placeholder="opcional" />
            <label className="block" htmlFor="item-cat">
              <span className="mb-1 block text-xs font-semibold text-white/60">Categoria</span>
              <select
                id="item-cat"
                value={f.categoria_id ?? ""}
                onChange={(e) => set("categoria_id", e.target.value || null)}
                className="w-full rounded-xl border border-white/10 bg-[#1b1a21] px-3 py-2.5 text-[15px] outline-none"
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* etiquetas */}
          <div>
            <div className="mb-2 text-xs font-semibold text-white/60">Etiquetas</div>
            <div className="flex flex-wrap gap-1.5">
              {[...TAGS_PAINEL, ...f.tags.filter((t) => !TAGS_PAINEL.includes(t))].map((t) => {
                const on = f.tags.includes(t)
                return (
                  <button key={t} onClick={() => alternarTag(t)} className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-white bg-white font-semibold text-black" : "border-white/15 hover:bg-white/5"}`}>
                    {tagInfo(t).emoji} {tagInfo(t).label}
                  </button>
                )
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                id="item-tag-nova"
                value={novaTag}
                onChange={(e) => setNovaTag(e.target.value)}
                placeholder="Outra etiqueta (ex.: contém amendoim)"
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none placeholder:text-white/25"
              />
              <button
                onClick={() => {
                  const t = novaTag.trim()
                  if (t && !f.tags.includes(t)) set("tags", [...f.tags, t])
                  setNovaTag("")
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 text-sm"
              >
                <Plus className="h-4 w-4" /> Adicionar
              </button>
            </div>
          </div>

          {/* serve / preparo */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold text-white/60">Serve</div>
              <div className="flex flex-wrap gap-1.5">
                {SERVE.map((s) => (
                  <button
                    key={s}
                    onClick={() => set("serve", f.serve === s ? null : s)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${f.serve === s ? "border-white bg-white font-semibold text-black" : "border-white/15 hover:bg-white/5"}`}
                  >
                    👥 {s}
                  </button>
                ))}
              </div>
            </div>
            <Campo id="item-preparo" l="Tempo de preparo" v={f.tempo_preparo ?? ""} on={(v) => set("tempo_preparo", v)} placeholder="Ex.: 15 min" />
          </div>

          {/* destaque do mês */}
          <div className="rounded-xl border border-white/10 p-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input id="item-mes" type="checkbox" checked={f.destaque_mes} onChange={(e) => set("destaque_mes", e.target.checked)} className="h-5 w-5 accent-amber-300" />
              <span className="flex items-center gap-1.5 font-semibold">
                <Crown className="h-4 w-4 text-amber-300" /> Item do mês
              </span>
              <span className="text-xs text-white/50">aparece na aba “Do mês” e no topo do feed</span>
            </label>
            {f.destaque_mes && (
              <div className="mt-3">
                <Campo id="item-nota" l="Recado do chef (opcional)" v={f.nota_chef ?? ""} on={(v) => set("nota_chef", v)} placeholder="Ex.: Lançamento de outubro, com ingrediente da estação." />
              </div>
            )}
          </div>

          {/* combina com */}
          <label className="block" htmlFor="item-combina">
            <span className="mb-1 block text-xs font-semibold text-white/60">Combina com (sugestão que aparece no vídeo)</span>
            <select
              id="item-combina"
              value={f.combina_com ?? ""}
              onChange={(e) => set("combina_com", e.target.value || null)}
              className="w-full rounded-xl border border-white/10 bg-[#1b1a21] px-3 py-2.5 text-[15px] outline-none"
            >
              <option value="">Nenhum</option>
              {itens
                .filter((i) => i.id !== item?.id)
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome}
                  </option>
                ))}
            </select>
          </label>

          {/* vendas */}
          <div>
            <div className="mb-1 text-xs font-semibold text-white/60">Vendas (opcional) · alimentam a aba “Mais pedidos”</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo id="item-vendas" l="Vendidos neste mês" v={f.pedidos_mes} on={(v) => set("pedidos_mes", v)} placeholder="Ex.: 320" />
              <Campo id="item-vendas-ant" l="Vendidos no mês passado" v={f.pedidos_mes_anterior} on={(v) => set("pedidos_mes_anterior", v)} placeholder="Ex.: 280" />
            </div>
            <p className="mt-1 text-xs text-white/40">Sem vendas informadas, a aba vira “Em alta” e usa vídeos vistos e curtidas.</p>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input id="item-ativo" type="checkbox" checked={f.ativo} onChange={(e) => set("ativo", e.target.checked)} className="h-5 w-5" />
            <span className="text-sm">Mostrar no cardápio (desmarque se acabou o estoque)</span>
          </label>
        </div>

        <div className="flex items-center gap-3 border-t border-white/[0.07] px-5 py-4">
          {erro && <p className="flex-1 text-sm font-semibold text-rose-400">{erro}</p>}
          <button onClick={cancelar} className="ml-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5">
            Cancelar
          </button>
          <button onClick={salvar} disabled={!!enviando} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50">
            {item ? "Salvar" : "Adicionar item"}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Barra do envio do vídeo: porcentagem, MB enviados e tempo que falta. */
function BarraProgresso({ enviado, total, inicio, agora }: { enviado: number; total: number; inicio: number; agora: number }) {
  const pct = total ? Math.min(100, Math.round((enviado / total) * 100)) : 0
  const segundos = (agora - inicio) / 1000
  const velocidade = segundos > 1 ? enviado / segundos : 0
  const falta = velocidade ? Math.max(0, Math.round((total - enviado) / velocidade)) : null
  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-400 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs tabular-nums text-white/60">
        {pct}% · {mb(enviado)} de {mb(total)}
        {falta !== null && pct < 100 ? ` · falta ${falta < 60 ? `${falta} s` : `${Math.ceil(falta / 60)} min`}` : ""}
        {pct === 100 ? " · finalizando…" : ""}
      </p>
    </div>
  )
}
