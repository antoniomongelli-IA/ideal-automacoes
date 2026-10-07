"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDown, ArrowUp, BarChart3, Check, Copy, Crown, ExternalLink, LayoutList, Loader2, LogOut, Palette, Pause, Pencil, Percent, Play, Plus, Smartphone, Store, Tags, Trash2 } from "lucide-react"
import { supabaseConfigurado, supabaseNavegador } from "@/lib/supabase/cliente"
import { type EstabelecimentoBanco, meusEstabelecimentos, sairDono, usuarioLogado } from "@/lib/cardapio/dono"
import { type CategoriaBanco, type ItemBanco, paraRestaurante, type PromocaoBanco } from "@/lib/cardapio/mapear"
import { brandingPadrao } from "@/lib/cardapio/nichos"
import { apagarArquivo, enviarArquivo } from "@/lib/cardapio/uploads"
import { brl, FONTES } from "@/lib/cardapio/utils"
import type { Branding } from "@/lib/cardapio/types"
import { MenuApp } from "../../MenuApp"
import { LogoMarca } from "../../ui"
import { Campo, EditorMarca } from "../../marca/EditorMarca"
import { EditorItem } from "./EditorItem"
import { Resultados } from "./Resultados"
import { AbaPromocoes } from "./AbaPromocoes"

type Aba = "resultados" | "itens" | "promocoes" | "categorias" | "marca" | "dados"
const ABAS: { id: Aba; l: string; i: typeof BarChart3 }[] = [
  { id: "resultados", l: "Resultados", i: BarChart3 },
  { id: "itens", l: "Itens", i: LayoutList },
  { id: "promocoes", l: "Promoções", i: Percent },
  { id: "categorias", l: "Categorias", i: Tags },
  { id: "marca", l: "Marca", i: Palette },
  { id: "dados", l: "Dados do local", i: Store },
]
const card = "rounded-2xl border border-white/[0.07] bg-[#15141a]"

export function PainelDono() {
  const router = useRouter()
  const params = useSearchParams()
  const novo = params.get("novo") === "1"
  const [carregando, setCarregando] = useState(true)
  const [lista, setLista] = useState<EstabelecimentoBanco[]>([])
  const [est, setEst] = useState<EstabelecimentoBanco | null>(null)
  const [categorias, setCategorias] = useState<CategoriaBanco[]>([])
  const [itens, setItens] = useState<ItemBanco[]>([])
  const [promocoes, setPromocoes] = useState<PromocaoBanco[]>([])
  const [aba, setAba] = useState<Aba>(novo ? "itens" : "resultados")
  const [editando, setEditando] = useState<{ item?: ItemBanco; categoria?: string | null } | null>(null)
  const [aviso, setAviso] = useState("")

  const avisar = (m: string) => {
    setAviso(m)
    setTimeout(() => setAviso(""), 2500)
  }

  const abrir = useCallback(async (e: EstabelecimentoBanco) => {
    setEst(e)
    const sb = supabaseNavegador()
    const [c, i, p] = await Promise.all([
      sb.from("categorias").select("id, nome, emoji, ordem").eq("estabelecimento_id", e.id).order("ordem"),
      sb.from("itens").select("*").eq("estabelecimento_id", e.id).order("ordem"),
      sb.from("promocoes").select("*").eq("estabelecimento_id", e.id).order("criado_em"),
    ])
    setCategorias((c.data as CategoriaBanco[]) ?? [])
    setItens((i.data as ItemBanco[]) ?? [])
    setPromocoes((p.data as PromocaoBanco[]) ?? [])
  }, [])

  useEffect(() => {
    if (!supabaseConfigurado) return
    ;(async () => {
      if (!(await usuarioLogado())) return router.replace("/cardapio/entrar")
      const l = await meusEstabelecimentos()
      setLista(l)
      if (l[0]) await abrir(l[0])
      setCarregando(false)
    })()
  }, [router, abrir])

  const branding: Branding = useMemo(() => {
    if (!est) return brandingPadrao("")
    const b = { ...brandingPadrao(est.nome, est.nicho), ...est.branding }
    if (est.logo_url) b.logo = est.logo_url
    return b
  }, [est])

  const previa = useMemo(() => (est ? paraRestaurante({ ...est, logo_url: est.logo_url, branding }, categorias, itens, promocoes) : null), [est, branding, categorias, itens, promocoes])

  if (!supabaseConfigurado)
    return (
      <Centro>
        <h1 className="text-2xl font-bold">Painel indisponível</h1>
        <p className="mt-2 text-white/60">O banco de dados ainda não está conectado. Enquanto isso, veja o painel de demonstração.</p>
        <Link href="/cardapio/brasa-burger/painel" className="mt-4 inline-block rounded-xl bg-white px-4 py-2.5 font-bold text-black">
          Abrir demonstração
        </Link>
      </Centro>
    )
  if (carregando)
    return (
      <Centro>
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </Centro>
    )
  if (!est)
    return (
      <Centro>
        <h1 className="text-2xl font-bold">Você ainda não tem um cardápio</h1>
        <Link href="/cardapio/cadastro" className="mt-4 inline-block rounded-xl bg-white px-4 py-2.5 font-bold text-black">
          Criar meu cardápio
        </Link>
      </Centro>
    )

  // ------------------------------------------------------------- ações

  const salvarEst = async (mudanca: Partial<EstabelecimentoBanco>, msg = "Salvo") => {
    const { data, error } = await supabaseNavegador().from("estabelecimentos").update(mudanca).eq("id", est.id).select().single()
    if (error) return avisar(`Erro: ${error.message}`)
    setEst(data as EstabelecimentoBanco)
    avisar(msg)
  }

  const atualizarItem = async (id: string, mudanca: Partial<ItemBanco>) => {
    setItens((l) => l.map((i) => (i.id === id ? { ...i, ...mudanca } : i)))
    const { error } = await supabaseNavegador().from("itens").update(mudanca).eq("id", id)
    if (error) avisar(`Erro: ${error.message}`)
  }

  const moverItem = async (id: string, dir: -1 | 1) => {
    const ordenados = [...itens].sort((a, b) => a.ordem - b.ordem)
    const i = ordenados.findIndex((x) => x.id === id)
    const j = i + dir
    if (j < 0 || j >= ordenados.length) return
    ;[ordenados[i], ordenados[j]] = [ordenados[j], ordenados[i]]
    const renumerados = ordenados.map((x, k) => ({ ...x, ordem: k }))
    setItens(renumerados)
    const sb = supabaseNavegador()
    await Promise.all([renumerados[i], renumerados[j]].map((x) => sb.from("itens").update({ ordem: x.ordem }).eq("id", x.id)))
  }

  const apagarItem = async (it: ItemBanco) => {
    if (!window.confirm(`Apagar "${it.nome}"? Isso não pode ser desfeito.`)) return
    const { error } = await supabaseNavegador().from("itens").delete().eq("id", it.id)
    if (error) return avisar(`Erro: ${error.message}`)
    setItens((l) => l.filter((i) => i.id !== it.id))
    await Promise.all([it.video_url, it.poster_url, it.foto_url].map(apagarArquivo))
    avisar("Item apagado")
  }

  const salvarCategoria = async (c: CategoriaBanco) => {
    const { error } = await supabaseNavegador().from("categorias").update({ nome: c.nome, emoji: c.emoji, ordem: c.ordem }).eq("id", c.id)
    if (error) avisar(`Erro: ${error.message}`)
  }
  const novaCategoria = async () => {
    const { data, error } = await supabaseNavegador()
      .from("categorias")
      .insert({ estabelecimento_id: est.id, nome: "Nova categoria", emoji: "🍽️", ordem: categorias.length })
      .select("id, nome, emoji, ordem")
      .single()
    if (error) return avisar(`Erro: ${error.message}`)
    setCategorias((l) => [...l, data as CategoriaBanco])
  }
  const moverCategoria = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= categorias.length) return
    const l = [...categorias]
    ;[l[idx], l[j]] = [l[j], l[idx]]
    const r = l.map((c, k) => ({ ...c, ordem: k }))
    setCategorias(r)
    await Promise.all([r[idx], r[j]].map(salvarCategoria))
  }
  const apagarCategoria = async (c: CategoriaBanco) => {
    if (!window.confirm(`Apagar a categoria "${c.nome}"? Os itens dela ficam em "Outros".`)) return
    await supabaseNavegador().from("categorias").delete().eq("id", c.id)
    setCategorias((l) => l.filter((x) => x.id !== c.id))
    setItens((l) => l.map((i) => (i.categoria_id === c.id ? { ...i, categoria_id: null } : i)))
  }

  const linkCardapio = `/cardapio/${est.slug}`
  const grupos = [...categorias.map((c) => ({ c, itens: itens.filter((i) => i.categoria_id === c.id) })), { c: null, itens: itens.filter((i) => !i.categoria_id || !categorias.some((c) => c.id === i.categoria_id)) }].filter(
    (g) => g.c || g.itens.length,
  )

  return (
    <div className="min-h-[100dvh] bg-[#0c0b10] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0c0b10]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 md:px-8">
          <span style={{ fontFamily: FONTES[branding.fontDisplay].css }}>
            <LogoMarca b={branding} size={34} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-bold leading-tight">{est.nome}</h1>
            <p className="text-xs text-white/50">Painel do estabelecimento</p>
          </div>
          {lista.length > 1 && (
            <select value={est.id} onChange={(e) => abrir(lista.find((x) => x.id === e.target.value)!)} className="rounded-lg border border-white/10 bg-[#15141a] px-2 py-1.5 text-sm" aria-label="Trocar estabelecimento">
              {lista.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nome}
                </option>
              ))}
            </select>
          )}
          <div className="ml-auto flex items-center gap-2">
            <a href={linkCardapio} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5">
              <ExternalLink className="h-4 w-4" /> Ver cardápio
            </a>
            <button
              onClick={async () => {
                await sairDono()
                router.replace("/cardapio/entrar")
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 md:px-8">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition ${aba === a.id ? "border-white text-white" : "border-transparent text-white/50 hover:text-white/80"}`}
            >
              <a.i className="h-4 w-4" /> {a.l}
            </button>
          ))}
        </nav>
      </header>

      {aviso && <div className="fixed left-1/2 top-24 z-50 w-max max-w-[90vw] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-black shadow-xl">{aviso}</div>}

      <div className={`mx-auto grid max-w-[1400px] gap-6 px-4 py-6 md:px-8 ${aba === "resultados" ? "" : "xl:grid-cols-[1fr_360px]"}`}>
        <main className="min-w-0">
          {novo && aba === "itens" && itens.length === 0 && (
            <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
              <p className="font-semibold">🎉 Seu cardápio foi criado!</p>
              <p className="mt-1 text-sm text-white/70">Agora adicione os itens com foto ou vídeo. O link já funciona: {typeof window !== "undefined" ? window.location.origin : ""}{linkCardapio}</p>
            </div>
          )}

          {aba === "resultados" && <Resultados estId={est.id} />}

          {aba === "itens" && (
            <div className="space-y-5">
              {itens.some((i) => !i.ativo) && (
                <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                  ⏸ {itens.filter((i) => !i.ativo).length} {itens.filter((i) => !i.ativo).length === 1 ? "item pausado" : "itens pausados"}: não aparecem no cardápio. Quando voltar a ter, toque em
                  “Voltar ao cardápio”.
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-white/60">
                  {itens.length} {itens.length === 1 ? "item" : "itens"} · toque em um item para editar · “Pausar” tira do cardápio sem apagar (ex.: acabou hoje)
                </p>
                <button onClick={() => setEditando({ categoria: categorias[0]?.id ?? null })} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black">
                  <Plus className="h-4 w-4" /> Novo item
                </button>
              </div>
              {grupos.map(({ c, itens: lista }) => (
                <section key={c?.id ?? "outros"} className={`${card} p-3`}>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <h3 className="font-semibold">
                      {c ? `${c.emoji} ${c.nome}` : "✨ Outros (sem categoria)"} <span className="text-sm font-normal text-white/40">· {lista.length}</span>
                    </h3>
                    <button onClick={() => setEditando({ categoria: c?.id ?? null })} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-white/60 hover:bg-white/5">
                      <Plus className="h-4 w-4" /> Adicionar
                    </button>
                  </div>
                  {lista.length === 0 && <p className="px-1 pb-2 text-sm text-white/40">Nenhum item nesta categoria.</p>}
                  <ul className="space-y-1.5">
                    {lista
                      .sort((a, b) => a.ordem - b.ordem)
                      .map((it) => (
                        <li key={it.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl p-2 hover:bg-white/[0.04]">
                          <button onClick={() => setEditando({ item: it })} className={`flex min-w-[220px] flex-1 items-center gap-3 text-left ${it.ativo ? "" : "opacity-50"}`}>
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
                              {(it.poster_url || it.foto_url) && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={it.poster_url || it.foto_url || ""} alt="" className="h-full w-full object-cover" />
                              )}
                              {it.video_url && <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[9px]">▶</span>}
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-center gap-1.5 truncate font-semibold">
                                {it.destaque_mes && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
                                {it.nome}
                              </span>
                              <span className="text-sm text-white/55">
                                {brl(Number(it.preco))}
                                {!it.video_url && !it.foto_url && <span className="ml-2 text-amber-300">· sem foto/vídeo</span>}
                              </span>
                              {!it.ativo && <span className="block text-xs font-semibold text-amber-300">⏸ Pausado · fora do cardápio</span>}
                            </span>
                          </button>
                          <div className="ml-auto flex items-center gap-0.5">
                            <button
                              onClick={() => {
                                atualizarItem(it.id, { ativo: !it.ativo })
                                avisar(it.ativo ? `“${it.nome}” pausado: saiu do cardápio` : `“${it.nome}” voltou ao cardápio`)
                              }}
                              className={`mr-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ${it.ativo ? "border border-white/15 text-white/75 hover:bg-white/5" : "bg-emerald-400 text-black"}`}
                            >
                              {it.ativo ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                              {it.ativo ? "Pausar" : "Voltar ao cardápio"}
                            </button>
                            <IconeBtn titulo="Item do mês" onClick={() => atualizarItem(it.id, { destaque_mes: !it.destaque_mes })}>
                              <Crown className={`h-4 w-4 ${it.destaque_mes ? "text-amber-300" : ""}`} fill={it.destaque_mes ? "currentColor" : "none"} />
                            </IconeBtn>
                            <IconeBtn titulo="Subir" onClick={() => moverItem(it.id, -1)}>
                              <ArrowUp className="h-4 w-4" />
                            </IconeBtn>
                            <IconeBtn titulo="Descer" onClick={() => moverItem(it.id, 1)}>
                              <ArrowDown className="h-4 w-4" />
                            </IconeBtn>
                            <IconeBtn titulo="Editar" onClick={() => setEditando({ item: it })}>
                              <Pencil className="h-4 w-4" />
                            </IconeBtn>
                            <IconeBtn titulo="Apagar" onClick={() => apagarItem(it)}>
                              <Trash2 className="h-4 w-4" />
                            </IconeBtn>
                          </div>
                        </li>
                      ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {aba === "promocoes" && <AbaPromocoes estId={est.id} promocoes={promocoes} mudarPromocoes={setPromocoes} itens={itens} avisar={avisar} />}

          {aba === "categorias" && (
            <div className={`${card} space-y-2 p-4`}>
              <p className="mb-2 text-sm text-white/60">A ordem aqui é a ordem das abas e seções do cardápio.</p>
              {categorias.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-2">
                  <input
                    aria-label="Emoji"
                    value={c.emoji}
                    onChange={(e) => setCategorias((l) => l.map((x) => (x.id === c.id ? { ...x, emoji: e.target.value.slice(0, 4) } : x)))}
                    onBlur={() => salvarCategoria(c)}
                    className="w-14 rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2.5 text-center text-lg outline-none"
                  />
                  <input
                    aria-label="Nome da categoria"
                    value={c.nome}
                    onChange={(e) => setCategorias((l) => l.map((x) => (x.id === c.id ? { ...x, nome: e.target.value } : x)))}
                    onBlur={() => salvarCategoria(c)}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 outline-none focus:border-white/40"
                  />
                  <span className="hidden text-sm text-white/40 sm:inline">{itens.filter((i) => i.categoria_id === c.id).length} itens</span>
                  <IconeBtn titulo="Subir" onClick={() => moverCategoria(idx, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </IconeBtn>
                  <IconeBtn titulo="Descer" onClick={() => moverCategoria(idx, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </IconeBtn>
                  <IconeBtn titulo="Apagar" onClick={() => apagarCategoria(c)}>
                    <Trash2 className="h-4 w-4" />
                  </IconeBtn>
                </div>
              ))}
              <button onClick={novaCategoria} className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold">
                <Plus className="h-4 w-4" /> Nova categoria
              </button>
            </div>
          )}

          {aba === "marca" && <AbaMarca est={est} branding={branding} salvarEst={salvarEst} avisar={avisar} />}
          {aba === "dados" && <AbaDados est={est} salvarEst={salvarEst} />}
        </main>

        {aba !== "resultados" && previa && (
          <aside className="xl:sticky xl:top-[120px] xl:self-start">
            <p className="mb-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-white/60">
              <Smartphone className="h-4 w-4" /> Como o cliente vê
            </p>
            <div className="relative mx-auto h-[700px] w-[340px] overflow-hidden rounded-[44px] border-[9px] border-[#1f1e25]">
              {previa.itens.length ? (
                <MenuApp key={`${previa.itens.length}-${branding.primary}-${branding.logo}`} restaurante={previa} embutido />
              ) : (
                <div className="grid h-full place-items-center p-8 text-center text-sm text-white/50" style={{ background: branding.bg }}>
                  Adicione o primeiro item para ver o cardápio aqui.
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {editando && (
        <EditorItem
          estId={est.id}
          item={editando.item}
          categoriaInicial={editando.categoria}
          categorias={categorias}
          itens={itens}
          aoFechar={() => setEditando(null)}
          aoSalvar={(salvo) => {
            setItens((l) => (l.some((i) => i.id === salvo.id) ? l.map((i) => (i.id === salvo.id ? salvo : i)) : [...l, salvo]))
            setEditando(null)
            avisar("Item salvo")
          }}
        />
      )}
    </div>
  )
}

function AbaMarca({ est, branding, salvarEst, avisar }: { est: EstabelecimentoBanco; branding: Branding; salvarEst: (m: Partial<EstabelecimentoBanco>, msg?: string) => Promise<void>; avisar: (m: string) => void }) {
  const [rascunho, setRascunho] = useState(branding)
  const [salvando, setSalvando] = useState(false)
  const mudou = JSON.stringify(rascunho) !== JSON.stringify(branding)

  return (
    <div className={`${card} p-5`}>
      <EditorMarca
        branding={rascunho}
        mudar={setRascunho}
        aoEnviarLogo={async (arquivo) => {
          try {
            const url = await enviarArquivo(est.id, "logo", arquivo, arquivo.name)
            const antiga = est.logo_url
            await salvarEst({ logo_url: url }, "Logo atualizada")
            setRascunho((r) => ({ ...r, logo: url }))
            await apagarArquivo(antiga)
          } catch (e) {
            avisar(e instanceof Error ? e.message : "Falha ao enviar a logo")
          }
        }}
      />
      <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/[0.07] pt-4">
        {mudou && <span className="mr-auto text-sm text-amber-200">Alterações não salvas</span>}
        <button onClick={() => setRascunho(branding)} disabled={!mudou} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 disabled:opacity-30">
          Desfazer
        </button>
        <button
          disabled={!mudou || salvando}
          onClick={async () => {
            setSalvando(true)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { logo: _logo, ...marca } = rascunho
            await salvarEst({ branding: marca }, "Marca salva: o cardápio já está atualizado")
            setSalvando(false)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-40"
          style={{ background: rascunho.primary, color: rascunho.onPrimary }}
        >
          <Check className="h-4 w-4" /> Salvar marca
        </button>
      </div>
    </div>
  )
}

function AbaDados({ est, salvarEst }: { est: EstabelecimentoBanco; salvarEst: (m: Partial<EstabelecimentoBanco>, msg?: string) => Promise<void> }) {
  const [f, setF] = useState({ nome: est.nome, cidade: est.cidade ?? "", endereco: est.endereco ?? "", horario: est.horario ?? "", whatsapp: est.whatsapp ?? "", instagram: est.instagram ?? "" })
  const [copiado, setCopiado] = useState(false)
  const link = typeof window !== "undefined" ? `${window.location.origin}/cardapio/${est.slug}` : `/cardapio/${est.slug}`
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }))

  return (
    <div className="space-y-4">
      <div className={`${card} p-5`}>
        <div className="text-xs font-semibold text-white/60">Link do cardápio</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <code className="rounded-lg bg-white/[0.06] px-3 py-2 text-sm">{link}</code>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(link).catch(() => {})
              setCopiado(true)
              setTimeout(() => setCopiado(false), 1500)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm"
          >
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p className="mt-2 text-xs text-white/45">Este é o link que vai no QR Code e na etiqueta NFC das mesas. Cada item também tem o próprio link ao compartilhar.</p>
      </div>

      <div className={`${card} space-y-3 p-5`}>
        <Campo id="dados-nome" l="Nome do estabelecimento" v={f.nome} on={set("nome")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo id="dados-cidade" l="Cidade" v={f.cidade} on={set("cidade")} />
          <Campo id="dados-horario" l="Horário de funcionamento" v={f.horario} on={set("horario")} placeholder="Ter a Dom · 18h às 23h" />
        </div>
        <Campo id="dados-endereco" l="Endereço" v={f.endereco} on={set("endereco")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo id="dados-whats" l="WhatsApp" v={f.whatsapp} on={set("whatsapp")} />
          <Campo id="dados-insta" l="Instagram" v={f.instagram} on={set("instagram")} />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => salvarEst({ nome: f.nome.trim() || est.nome, cidade: f.cidade || null, endereco: f.endereco || null, horario: f.horario || null, whatsapp: f.whatsapp || null, instagram: f.instagram || null })}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black"
          >
            Salvar dados
          </button>
        </div>
      </div>

      <AbaExtras est={est} salvarEst={salvarEst} />

      <div className={`${card} flex flex-wrap items-center justify-between gap-3 p-5`}>
        <div>
          <div className="font-semibold">{est.ativo ? "Cardápio no ar" : "Cardápio fora do ar"}</div>
          <p className="text-sm text-white/55">{est.ativo ? "Qualquer pessoa com o link vê o cardápio." : "O link mostra “página não encontrada” até você ligar de novo."}</p>
        </div>
        <button onClick={() => salvarEst({ ativo: !est.ativo }, est.ativo ? "Cardápio tirado do ar" : "Cardápio no ar")} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold">
          {est.ativo ? "Tirar do ar" : "Colocar no ar"}
        </button>
      </div>
    </div>
  )
}

/** Botão "Pedir pelo WhatsApp" e link "Avalie no Google". */
function AbaExtras({ est, salvarEst }: { est: EstabelecimentoBanco; salvarEst: (m: Partial<EstabelecimentoBanco>, msg?: string) => Promise<void> }) {
  const [google, setGoogle] = useState(est.google_avaliacao ?? "")
  const linkValido = !google || /^https?:\/\/\S+$/.test(google.trim())
  return (
    <div className={`${card} space-y-5 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-md">
          <div className="font-semibold">Pedir pelo WhatsApp</div>
          <p className="text-sm text-white/55">
            Mostra o botão “Pedir” em cada item. O cliente cai no WhatsApp do estabelecimento com a mensagem pronta (nome do item, preço e link).
          </p>
          {!est.whatsapp && <p className="mt-1 text-sm text-amber-300">Preencha o WhatsApp acima e salve para poder ligar.</p>}
        </div>
        <button
          disabled={!est.whatsapp}
          onClick={() => salvarEst({ pedido_whatsapp: !est.pedido_whatsapp }, est.pedido_whatsapp ? "Botão de pedido desligado" : "Botão “Pedir pelo WhatsApp” ligado")}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40 ${est.pedido_whatsapp ? "bg-emerald-400 text-black" : "border border-white/15"}`}
        >
          {est.pedido_whatsapp ? "Ligado" : "Desligado"}
        </button>
      </div>

      <div className="border-t border-white/[0.07] pt-5">
        <div className="font-semibold">Avalie no Google</div>
        <p className="mb-3 text-sm text-white/55">
          Depois de 5 minutos no cardápio, aparece um convite para o cliente avaliar o estabelecimento no Google (no máximo 1 vez por mês para cada pessoa). Deixe vazio para não mostrar.
        </p>
        <Campo id="dados-google" l="Link de avaliação do Google" v={google} on={setGoogle} placeholder="https://g.page/r/.../review" dica="Como pegar: no Google, abra o Perfil da Empresa → “Pedir avaliações” → copie o link." />
        {!linkValido && <p className="mt-1 text-sm text-rose-400">Cole o link completo, começando com https://</p>}
        <div className="mt-3 flex justify-end">
          <button
            disabled={!linkValido}
            onClick={() => salvarEst({ google_avaliacao: google.trim() || null }, google.trim() ? "Link do Google salvo" : "Convite do Google desligado")}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40"
          >
            Salvar link
          </button>
        </div>
      </div>
    </div>
  )
}

function IconeBtn({ titulo, onClick, children }: { titulo: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={titulo} aria-label={titulo} className="grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:bg-white/[0.06] hover:text-white">
      {children}
    </button>
  )
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#0c0b10] px-6 text-center text-white">
      <div>{children}</div>
    </main>
  )
}
