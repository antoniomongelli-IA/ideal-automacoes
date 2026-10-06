"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { BellRing, Check, Clock, MapPin, Minus, Plus, Receipt, Users, X } from "lucide-react"
import type { Restaurante } from "@/lib/cardapio/types"
import { brandingVars, brl, ordemFeed, posterSrc, rankDe, TAGS } from "@/lib/cardapio/utils"
import { aplicarPersonalizacao, usePersonalizacao } from "@/lib/cardapio/personalizacao"
import { Feed } from "./Feed"
import { DoMes, Grade, MaisPedidos } from "./Abas"
import { type Aba, MenuContext, type MenuCtx, SeloMes, SeloRank, useMenu } from "./ui"

const ABAS: { id: Aba; label: string }[] = [
  { id: "feed", label: "Para você" },
  { id: "top", label: "Mais pedidos" },
  { id: "mes", label: "Do mês" },
  { id: "cardapio", label: "Cardápio" },
]

interface Props {
  restaurante: Restaurante
  mesa?: string
  itemInicial?: string
  /** dentro do painel (pré-visualização): sem tela de abertura e sem ler o localStorage */
  embutido?: boolean
}

export function MenuApp({ restaurante, mesa, itemInicial, embutido = false }: Props) {
  const [personalizacao] = usePersonalizacao(restaurante.slug)
  const r = useMemo(() => (embutido ? restaurante : aplicarPersonalizacao(restaurante, personalizacao)), [embutido, restaurante, personalizacao])
  const ranks = useMemo(() => rankDe(r.itens), [r.itens])
  const feed = useMemo(() => ordemFeed(r.itens), [r.itens])

  const [aba, setAba] = useState<Aba>("feed")
  const [feedInicio, setFeedInicio] = useState<{ id?: string; n: number }>({ id: itemInicial, n: 0 })
  const [carrinho, setCarrinho] = useState<Record<string, number>>({})
  const [curtidos, setCurtidos] = useState<Set<string>>(new Set())
  const [info, setInfo] = useState<string | null>(null)
  const [comanda, setComanda] = useState(false)
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
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const item = useCallback((id: string) => r.itens.find((i) => i.id === id), [r.itens])

  const ctx: MenuCtx = {
    r,
    ranks,
    carrinho,
    curtidos,
    item,
    adicionar: (id) => {
      setCarrinho((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
      avisar(`${item(id)?.nome} na comanda`)
    },
    remover: (id) =>
      setCarrinho((c) => {
        const n = (c[id] ?? 0) - 1
        const next = { ...c }
        if (n <= 0) delete next[id]
        else next[id] = n
        return next
      }),
    curtir: (id, forcar) =>
      setCurtidos((s) => {
        const next = new Set(s)
        if (forcar || !next.has(id)) next.add(id)
        else next.delete(id)
        return next
      }),
    abrirNoFeed: (id) => {
      setInfo(null)
      setAba("feed")
      setFeedInicio((f) => ({ id, n: f.n + 1 }))
    },
    abrirInfo: setInfo,
  }

  const qtdTotal = Object.values(carrinho).reduce((a, b) => a + b, 0)
  const total = Object.entries(carrinho).reduce((s, [id, q]) => s + (item(id)?.preco ?? 0) * q, 0)
  const b = r.branding
  const noFeed = aba === "feed"

  const chamarGarcom = () => {
    setComanda(false)
    avisar(mesa ? `Garçom chamado para a mesa ${mesa} 🛎️` : "Garçom chamado! Já já alguém vem até você 🛎️")
  }

  return (
    <MenuContext.Provider value={ctx}>
      <div className="relative h-full w-full overflow-hidden" style={brandingVars(b)}>
        {/* conteúdo */}
        {noFeed ? (
          <Feed key={feedInicio.n} itens={feed} inicioId={feedInicio.id} />
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

        {/* topo */}
        <header
          className="absolute inset-x-0 top-0 z-20 px-4 pt-[calc(env(safe-area-inset-top)+10px)]"
          style={
            noFeed
              ? { color: "#fff" }
              : { background: `color-mix(in srgb, ${b.bg} 88%, transparent)`, backdropFilter: "blur(14px)", color: b.text, borderBottom: `1px solid color-mix(in srgb, ${b.text} 8%, transparent)` }
          }
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center text-lg font-bold"
                style={{ background: b.primary, color: b.onPrimary, borderRadius: Math.min(b.radius, 18), fontFamily: "var(--f-display)" }}
              >
                {b.logoMark}
              </span>
              <span className="truncate text-xl leading-none" style={{ fontFamily: "var(--f-display)" }}>
                {b.logoText}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {mesa && (
                <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={noFeed ? { background: "rgba(0,0,0,.4)" } : { background: b.surface }}>
                  Mesa {mesa}
                </span>
              )}
              <button
                onClick={chamarGarcom}
                aria-label="Chamar garçom"
                className="grid h-9 w-9 place-items-center rounded-full transition active:scale-90"
                style={noFeed ? { background: "rgba(0,0,0,.4)" } : { background: b.surface }}
              >
                <BellRing className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
          <nav className="relative mt-2 flex justify-between">
            {ABAS.map((a) => {
              const on = a.id === aba
              return (
                <button
                  key={a.id}
                  onClick={() => (a.id === "feed" ? ctx.abrirNoFeed(feed[0].id) : setAba(a.id))}
                  className={`relative whitespace-nowrap px-1 pb-2.5 pt-1.5 text-[13.5px] font-bold transition ${on ? "" : "opacity-60"}`}
                  style={noFeed ? { textShadow: "0 1px 6px rgba(0,0,0,.5)" } : undefined}
                >
                  {a.label}
                  {on && <motion.span layoutId="aba-ativa" className="absolute inset-x-2 bottom-1 h-[3px] rounded-full" style={{ background: b.primary }} />}
                </button>
              )
            })}
          </nav>
        </header>

        {/* barra da comanda */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <motion.button
            layout
            onClick={() => (qtdTotal ? setComanda(true) : setAba("cardapio"))}
            className="flex w-full items-center gap-3 px-4 py-3 text-left shadow-2xl shadow-black/40"
            style={{
              borderRadius: Math.max(b.radius, 10),
              background: qtdTotal ? b.primary : `color-mix(in srgb, ${b.surface} 82%, transparent)`,
              color: qtdTotal ? b.onPrimary : b.text,
              backdropFilter: "blur(14px)",
            }}
          >
            <Receipt className="h-5 w-5 shrink-0" />
            {qtdTotal ? (
              <>
                <span className="flex-1 text-sm font-bold">
                  Minha comanda · {qtdTotal} {qtdTotal === 1 ? "item" : "itens"}
                </span>
                <motion.span key={total} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="text-base font-extrabold">
                  {brl(total)}
                </motion.span>
              </>
            ) : (
              <span className="flex-1 text-sm font-semibold opacity-80">Toque em + para montar sua comanda</span>
            )}
          </motion.button>
        </div>

        {/* folha de detalhes */}
        <Folha aberta={!!info} fechar={() => setInfo(null)}>
          {info && <Detalhes id={info} />}
        </Folha>

        {/* folha da comanda */}
        <Folha aberta={comanda} fechar={() => setComanda(false)}>
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-display)" }}>
            Minha comanda {mesa && <span className="text-base opacity-60">· Mesa {mesa}</span>}
          </h3>
          <div className="mt-4 space-y-3">
            {Object.entries(carrinho).map(([id, q]) => {
              const it = item(id)
              if (!it) return null
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden" style={{ borderRadius: "calc(var(--radius) * 0.75)" }}>
                    <Image src={posterSrc(it.midia)} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{it.nome}</span>
                    <span className="text-xs" style={{ color: "var(--c-muted)" }}>
                      {brl(it.preco)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <button onClick={() => ctx.remover(id)} className="grid h-8 w-8 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--c-text) 10%, transparent)" }} aria-label="Remover um">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-5 text-center font-bold">{q}</span>
                    <button onClick={() => ctx.adicionar(id)} className="grid h-8 w-8 place-items-center rounded-full" style={{ background: "var(--c-primary)", color: "var(--c-on-primary)" }} aria-label="Adicionar um">
                      <Plus className="h-4 w-4" />
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: "color-mix(in srgb, var(--c-text) 12%, transparent)" }}>
            <span className="text-sm" style={{ color: "var(--c-muted)" }}>
              Total estimado
            </span>
            <span className="text-2xl font-extrabold">{brl(total)}</span>
          </div>
          <button
            onClick={chamarGarcom}
            className="mt-4 flex w-full items-center justify-center gap-2 py-3.5 font-bold"
            style={{ background: "var(--c-primary)", color: "var(--c-on-primary)", borderRadius: "var(--radius)" }}
          >
            <BellRing className="h-5 w-5" /> Chamar garçom para fazer o pedido
          </button>
          <p className="mt-2 text-center text-xs" style={{ color: "var(--c-muted)" }}>
            A comanda fica salva no seu celular para mostrar ao garçom.
          </p>
        </Folha>

        {/* toast */}
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

        {/* tela de abertura (simula a abertura pelo NFC/QR) */}
        <AnimatePresence>
          {splash && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 z-[60] flex flex-col items-center justify-center px-8 text-center"
              style={{ background: b.bg, color: b.text }}
            >
              <motion.span
                initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="grid h-24 w-24 place-items-center text-5xl shadow-2xl"
                style={{ background: b.primary, color: b.onPrimary, borderRadius: Math.min(b.radius * 2, 48), fontFamily: "var(--f-display)" }}
              >
                {b.logoMark}
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6 text-4xl leading-none" style={{ fontFamily: "var(--f-display)" }}>
                {r.nome}
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-3 text-sm" style={{ color: b.muted }}>
                {b.tagline}
              </motion.p>
              {mesa && (
                <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 rounded-full px-4 py-1.5 text-sm font-bold" style={{ background: b.surface }}>
                  Bem-vindo à mesa {mesa} 👋
                </motion.span>
              )}
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
  const { item, ranks, adicionar, abrirNoFeed, r } = useMenu()
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
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--c-muted)" }}>
        {it.descricao}
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        {[
          { icone: <Clock className="mx-auto mb-1 h-4 w-4" />, v: it.tempoPreparo ?? "—", l: "preparo" },
          { icone: <Users className="mx-auto mb-1 h-4 w-4" />, v: it.serve ?? "1 pessoa", l: "serve" },
          { icone: <MapPin className="mx-auto mb-1 h-4 w-4" />, v: it.pedidos30d.toLocaleString("pt-BR"), l: "pedidos/mês" },
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
      {it.notaDoChef && <blockquote className="mt-4 border-l-4 pl-3 text-sm italic" style={{ borderColor: "var(--c-primary)" }}>“{it.notaDoChef}” — Chef</blockquote>}
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
          <span className="text-sm font-bold">+{brl(combina.preco)}</span>
        </button>
      )}
      <button
        onClick={() => adicionar(it.id)}
        className="mt-5 flex w-full items-center justify-between px-5 py-3.5 font-bold"
        style={{ background: "var(--c-primary)", color: "var(--c-on-primary)", borderRadius: "var(--radius)" }}
      >
        <span className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Adicionar à comanda
        </span>
        <span>{brl(it.preco)}</span>
      </button>
    </div>
  )
}
