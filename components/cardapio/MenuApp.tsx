"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronLeft, Clock, Flame, Users, X } from "lucide-react"
import type { Item, Restaurante } from "@/lib/cardapio/types"
import { brandingVars, brl, ordemFeed, posterSrc, rankDe, TAGS } from "@/lib/cardapio/utils"
import { aplicarPersonalizacao, usePersonalizacao } from "@/lib/cardapio/personalizacao"
import { type Tela, useNavegacao } from "@/lib/cardapio/navegacao"
import { ArrastarVoltar } from "./ArrastarVoltar"
import { Feed } from "./Feed"
import { DoMes, Grade, MaisPedidos } from "./Abas"
import { type Aba, LogoMarca, MenuContext, type MenuCtx, SeloMes, SeloRank, useMenu } from "./ui"

const ABAS: { id: Aba; label: string }[] = [
  { id: "feed", label: "Para você" },
  { id: "top", label: "Mais pedidos" },
  { id: "mes", label: "Do mês" },
  { id: "cardapio", label: "Cardápio" },
]

interface Props {
  restaurante: Restaurante
  itemInicial?: string
  /** dentro do painel (pré-visualização): sem tela de abertura e sem ler o localStorage */
  embutido?: boolean
}

export function MenuApp({ restaurante, itemInicial, embutido = false }: Props) {
  const [personalizacao] = usePersonalizacao(restaurante.slug)
  const r = useMemo(() => (embutido ? restaurante : aplicarPersonalizacao(restaurante, personalizacao)), [embutido, restaurante, personalizacao])
  const ranks = useMemo(() => rankDe(r.itens), [r.itens])
  const feed = useMemo(() => ordemFeed(r.itens), [r.itens])

  const { tela, podeVoltar, ir, atualizar, voltar } = useNavegacao({ aba: "feed", feedId: itemInicial, n: 0 }, embutido)
  const aba = tela.aba
  const [curtidos, setCurtidos] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [splash, setSplash] = useState(!embutido)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!splash) return
    const t = setTimeout(() => setSplash(false), 1700)
    return () => clearTimeout(t)
  }, [splash])

  const avisar = useCallback((msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const item = useCallback((id: string) => r.itens.find((i) => i.id === id), [r.itens])

  const ctx: MenuCtx = {
    r,
    ranks,
    curtidos,
    item,
    avisar,
    curtir: (id, forcar) =>
      setCurtidos((s) => {
        const next = new Set(s)
        if (forcar || !next.has(id)) next.add(id)
        else next.delete(id)
        return next
      }),
    abrirNoFeed: (id, lista) => {
      const base: Tela = { ...tela, info: undefined }
      let proxima: Tela
      if (tela.aba === "feed" && !tela.video) {
        // já está no "Para você": pula para o prato dentro do próprio feed
        proxima = { ...base, feedId: id, n: tela.n + 1 }
      } else {
        // numa lista: abre o vídeo por cima, sem trocar de aba
        const atual = tela.video
        const l = lista ?? (atual?.lista.includes(id) ? atual.lista : [id])
        proxima = { ...base, video: { id, lista: l, n: (atual?.n ?? 0) + 1 } }
      }
      // vindo da folha de detalhes, troca a tela em vez de empilhar: o voltar pula a folha
      if (tela.info) atualizar(proxima)
      else ir(proxima)
    },
    abrirInfo: (id) => ir({ ...tela, info: id }),
  }

  const trocarAba = (nova: Aba) => {
    if (nova === aba) return
    ir(nova === "feed" ? { aba: "feed", n: tela.n + 1 } : { aba: nova, n: tela.n })
  }
  const lembrarPrato = useCallback((id: string) => atualizar({ feedId: id }), [atualizar])
  const video = tela.video
  // só vale para o vídeo que ainda está aberto (durante a animação de fechar, o feed ainda avisa)
  const lembrarPratoVideo = useCallback(
    (id: string) => atualizar((atual) => (atual.video && atual.video.n === video?.n ? { video: { ...atual.video, id } } : null)),
    [atualizar, video?.n],
  )
  const itensVideo = useMemo(() => (video ? video.lista.map(item).filter((i): i is Item => !!i) : []), [video, item])
  const nomeAba = ABAS.find((a) => a.id === aba)?.label ?? "Cardápio"

  const b = r.branding
  // topo transparente sobre vídeo (feed ou vídeo aberto por cima de uma lista)
  const noFeed = aba === "feed" || !!video

  return (
    <MenuContext.Provider value={ctx}>
      <div className="relative h-full w-full overflow-hidden" style={brandingVars(b)}>
        <ArrastarVoltar podeVoltar={podeVoltar} voltar={voltar} embutido={embutido}>
          <div className="absolute inset-0" style={{ background: b.bg }}>
            {/* conteúdo */}
            {aba === "feed" ? (
              <Feed key={tela.n} itens={feed} inicioId={tela.feedId} onAtivo={lembrarPrato} />
            ) : (
              <div className="absolute inset-0 overflow-y-auto pt-[calc(env(safe-area-inset-top)+108px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <AnimatePresence mode="wait">
                  <motion.div key={aba} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    {aba === "top" && <MaisPedidos />}
                    {aba === "mes" && <DoMes />}
                    {aba === "cardapio" && <Grade />}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* vídeo aberto por cima da lista: a lista continua montada embaixo, no mesmo ponto */}
            <AnimatePresence>
              {video && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.22 }}
                  className="absolute inset-0 z-10 bg-black"
                >
                  <Feed key={video.n} itens={itensVideo} inicioId={video.id} onAtivo={lembrarPratoVideo} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* topo */}
            <header
              className="absolute inset-x-0 top-0 z-20 px-4 pt-[calc(env(safe-area-inset-top)+10px)]"
              style={
                noFeed
                  ? { color: "#fff" }
                  : { background: `color-mix(in srgb, ${b.bg} 88%, transparent)`, backdropFilter: "blur(14px)", color: b.text, borderBottom: `1px solid color-mix(in srgb, ${b.text} 8%, transparent)` }
              }
            >
              {video ? (
                <div className="flex min-w-0 items-center gap-2 pb-3">
                  <button
                    onClick={voltar}
                    className="-ml-1.5 inline-flex shrink-0 items-center gap-0.5 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-bold transition active:scale-95"
                    style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)" }}
                  >
                    <ChevronLeft className="h-5 w-5" /> Voltar {aba === "cardapio" ? "ao cardápio" : `para ${nomeAba}`}
                  </button>
                  <span className="ml-auto">
                    <LogoMarca b={b} size={32} />
                  </span>
                </div>
              ) : (
              <>
                <div className="flex min-w-0 items-center gap-2">
                  {podeVoltar && (
                    <button
                      onClick={voltar}
                      aria-label="Voltar"
                      className="-ml-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full transition active:scale-90"
                      style={noFeed ? { background: "rgba(0,0,0,.35)" } : { background: `color-mix(in srgb, ${b.text} 8%, transparent)` }}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  )}
                  <LogoMarca b={b} />
                  <span className="truncate text-xl leading-none" style={{ fontFamily: "var(--f-display)" }}>
                    {b.logoText}
                  </span>
                </div>
                <nav className="relative mt-2 flex justify-between">
                  {ABAS.map((a) => {
                    const on = a.id === aba
                    return (
                      <button
                        key={a.id}
                        onClick={() => trocarAba(a.id)}
                        className={`relative whitespace-nowrap px-1 pb-2.5 pt-1.5 text-[13.5px] font-bold transition ${on ? "" : "opacity-60"}`}
                        style={noFeed ? { textShadow: "0 1px 6px rgba(0,0,0,.5)" } : undefined}
                      >
                        {a.label}
                        {on && <motion.span layoutId="aba-ativa" className="absolute inset-x-2 bottom-1 h-[3px] rounded-full" style={{ background: b.primary }} />}
                      </button>
                    )
                  })}
                </nav>
              </>
              )}
            </header>

            {/* folha de detalhes */}
            <Folha aberta={!!tela.info} fechar={voltar}>
              {tela.info && <Detalhes id={tela.info} />}
            </Folha>
          </div>
        </ArrastarVoltar>

        {/* aviso rápido (ex.: link copiado) */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+112px)] z-50 flex justify-center px-6"
            >
              <span className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2.5 text-sm font-semibold text-white shadow-xl backdrop-blur">
                <Check className="h-4 w-4" style={{ color: b.primary }} /> {toast}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* tela de abertura (ao abrir pelo NFC/QR) */}
        <AnimatePresence>
          {splash && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 z-[60] flex flex-col items-center justify-center px-8 text-center"
              style={{ background: b.bg, color: b.text }}
            >
              <motion.span initial={{ scale: 0.3, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="shadow-2xl">
                <LogoMarca b={b} size={96} />
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6 text-4xl leading-none" style={{ fontFamily: "var(--f-display)" }}>
                {r.nome}
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-3 text-sm" style={{ color: b.muted }}>
                {b.tagline}
              </motion.p>
              <motion.span className="absolute bottom-10 h-1 w-24 overflow-hidden rounded-full" style={{ background: `color-mix(in srgb, ${b.text} 12%, transparent)` }}>
                <motion.span className="block h-full" style={{ background: b.primary }} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} />
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MenuContext.Provider>
  )
}

function Folha({ aberta, fechar, children }: { aberta: boolean; fechar: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {aberta && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fechar} className="absolute inset-0 z-40 bg-black/55" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => i.offset.y > 120 && fechar()}
            className="absolute inset-x-0 bottom-0 z-50 max-h-[82%] overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3"
            style={{ background: "var(--c-surface)", color: "var(--c-text)", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full" style={{ background: "color-mix(in srgb, var(--c-text) 20%, transparent)" }} />
            <button onClick={fechar} aria-label="Fechar" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--c-text) 8%, transparent)" }}>
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Detalhes({ id }: { id: string }) {
  const { item, ranks, abrirNoFeed, r } = useMenu()
  const it = item(id)
  if (!it) return null
  const combina = it.combinaCom ? item(it.combinaCom) : undefined
  const cat = r.categorias.find((c) => c.id === it.categoria)
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5 pr-10">
        <span className="rounded-full px-2 py-1 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--c-text) 8%, transparent)" }}>
          {cat?.emoji} {cat?.nome}
        </span>
        {it.destaqueDoMes && <SeloMes />}
        <SeloRank rank={ranks.get(it.id) ?? 99} />
      </div>
      <h3 className="text-3xl leading-none" style={{ fontFamily: "var(--f-display)" }}>
        {it.nome}
      </h3>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-2xl font-extrabold">{brl(it.preco)}</span>
        {it.precoAntigo && (
          <span className="text-sm line-through" style={{ color: "var(--c-muted)" }}>
            {brl(it.precoAntigo)}
          </span>
        )}
      </div>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--c-muted)" }}>
        {it.descricao}
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        {[
          { icone: <Clock className="mx-auto mb-1 h-4 w-4" />, v: it.tempoPreparo ?? "—", l: "preparo" },
          { icone: <Users className="mx-auto mb-1 h-4 w-4" />, v: it.serve ?? "1 pessoa", l: "serve" },
          { icone: <Flame className="mx-auto mb-1 h-4 w-4" />, v: it.pedidos30d.toLocaleString("pt-BR"), l: "pedidos/mês" },
        ].map((d) => (
          <div key={d.l} className="p-2.5" style={{ background: "color-mix(in srgb, var(--c-text) 6%, transparent)", borderRadius: "var(--radius)" }}>
            {d.icone}
            <dt className="font-bold">{d.v}</dt>
            <dd style={{ color: "var(--c-muted)" }}>{d.l}</dd>
          </div>
        ))}
      </dl>
      {!!it.tags?.length && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {it.tags.map((t) => (
            <span key={t} className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "color-mix(in srgb, var(--c-text) 8%, transparent)" }}>
              {TAGS[t].emoji} {TAGS[t].label}
            </span>
          ))}
        </div>
      )}
      {it.notaDoChef && (
        <blockquote className="mt-4 border-l-4 pl-3 text-sm italic" style={{ borderColor: "var(--c-primary)" }}>
          “{it.notaDoChef}” — Chef
        </blockquote>
      )}
      {combina && (
        <button onClick={() => abrirNoFeed(combina.id)} className="mt-4 flex w-full items-center gap-3 p-2 text-left" style={{ background: "color-mix(in srgb, var(--c-text) 6%, transparent)", borderRadius: "var(--radius)" }}>
          <span className="relative h-12 w-12 shrink-0 overflow-hidden" style={{ borderRadius: "calc(var(--radius) * 0.7)" }}>
            <Image src={posterSrc(combina.midia)} alt="" fill sizes="48px" className="object-cover" />
          </span>
          <span className="flex-1">
            <span className="block text-[10px] uppercase tracking-wider" style={{ color: "var(--c-muted)" }}>
              Combina com
            </span>
            <span className="block text-sm font-semibold">{combina.nome}</span>
          </span>
          <span className="text-sm font-bold">{brl(combina.preco)}</span>
        </button>
      )}
      <button
        onClick={() => abrirNoFeed(it.id)}
        className="mt-5 flex w-full items-center justify-center gap-2 py-3.5 font-bold"
        style={{ background: "var(--c-primary)", color: "var(--c-on-primary)", borderRadius: "var(--radius)" }}
      >
        Ver o vídeo
      </button>
    </div>
  )
}
