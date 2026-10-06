"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronUp, Clock, Heart, Info, Share2, Users } from "lucide-react"
import type { Item } from "@/lib/cardapio/types"
import { brl, capaDe, compacto, tagInfo, videosDe } from "@/lib/cardapio/utils"
import { registrarView } from "@/lib/cardapio/personalizacao"
import { registrarEvento } from "@/lib/cardapio/publico"
import { Capa, SeloMes, SeloRank, useMenu } from "./ui"

export function Feed({ itens, inicioId, onAtivo }: { itens: Item[]; inicioId?: string; onAtivo?: (id: string) => void }) {
  const { r } = useMenu()
  const ref = useRef<HTMLDivElement>(null)
  // o prato inicial só vale na montagem; depois quem manda é a rolagem
  const [inicio] = useState(() => Math.max(0, itens.findIndex((i) => i.id === inicioId)))
  const [ativo, setAtivo] = useState(inicio)
  const [dica, setDica] = useState(true)

  useLayoutEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = inicio * el.clientHeight
  }, [inicio])

  useEffect(() => {
    const t = setTimeout(() => setDica(false), 3500)
    return () => clearTimeout(t)
  }, [])

  // conta visualização depois de 1,2s parado no vídeo
  useEffect(() => {
    const it = itens[ativo]
    if (!it) return
    const t = setTimeout(() => {
      registrarView(r.slug, it.id)
      registrarEvento(r.id, "viu", it.id)
    }, 1200)
    return () => clearTimeout(t)
  }, [ativo, itens, r.slug, r.id])

  // guarda em que prato o feed está, para o "voltar" retornar ao mesmo ponto
  useEffect(() => {
    const it = itens[ativo]
    if (it) onAtivo?.(it.id)
  }, [ativo, itens, onAtivo])

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const i = Math.round(el.scrollTop / el.clientHeight)
    if (i !== ativo) {
      setAtivo(i)
      setDica(false)
    }
  }

  return (
    <div ref={ref} onScroll={onScroll} className="absolute inset-0 snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {itens.map((it, i) => (
        <Slide key={it.id} item={it} ativo={i === ativo} perto={Math.abs(i - ativo) <= 1} prioridade={i === inicio} />
      ))}
      <AnimatePresence>
        {dica && ativo === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 top-[44%] z-20 flex flex-col items-center text-white"
          >
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="flex flex-col items-center">
              <ChevronUp className="h-8 w-8 opacity-60" />
              <ChevronUp className="-mt-5 h-8 w-8" />
            </motion.div>
            <span className="mt-1 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold backdrop-blur">Deslize para ver o próximo prato</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Slide({ item, ativo, perto, prioridade }: { item: Item; ativo: boolean; perto: boolean; prioridade: boolean }) {
  const { r, ranks, curtidos, curtir, curtidasDe, abrirInfo, abrirNoFeed, avisar, item: buscar } = useMenu()
  const video = useRef<HTMLVideoElement>(null)
  const barra = useRef<HTMLDivElement>(null)
  const ultimoToque = useRef(0)
  const [coracoes, setCoracoes] = useState<{ id: number; x: number; y: number }[]>([])
  const [aberto, setAberto] = useState(false)
  const rank = ranks.get(item.id) ?? 99
  const combina = item.combinaCom ? buscar(item.combinaCom) : undefined
  const curtido = curtidos.has(item.id)
  const fontes = videosDe(item)

  useEffect(() => {
    const v = video.current
    if (!v) return
    if (ativo) {
      v.currentTime = 0
      v.play().catch(() => {})
    } else v.pause()
  }, [ativo])

  useEffect(() => {
    const v = video.current
    if (!v || !ativo) return
    let raf = 0
    const tick = () => {
      if (barra.current && v.duration) barra.current.style.transform = `scaleX(${v.currentTime / v.duration})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ativo, perto])

  const toque = (e: React.PointerEvent) => {
    const agora = Date.now()
    if (agora - ultimoToque.current < 300) {
      const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const id = agora
      setCoracoes((c) => [...c, { id, x: e.clientX - box.left, y: e.clientY - box.top }])
      setTimeout(() => setCoracoes((c) => c.filter((h) => h.id !== id)), 900)
      curtir(item.id, true)
    }
    ultimoToque.current = agora
  }

  const compartilhar = async () => {
    const url = `${location.origin}/cardapio/${r.slug}?item=${item.id}`
    try {
      registrarEvento(r.id, "compartilhou", item.id)
      if (navigator.share) await navigator.share({ title: `${item.nome} · ${r.nome}`, url })
      else {
        await navigator.clipboard.writeText(url)
        avisar("Link do prato copiado")
      }
    } catch {
      /* cancelado */
    }
  }


  return (
    <section className="relative h-full w-full snap-start snap-always overflow-hidden bg-black" onPointerUp={toque}>
      <Capa item={item} sizes="440px" priority={prioridade} zoom={!fontes.length} />
      {perto && fontes.length > 0 && (
        <video ref={video} poster={capaDe(item) || undefined} muted loop playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover">
          {fontes.map((f) => (
            <source key={f.src} src={f.src} type={f.type} />
          ))}
        </video>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <AnimatePresence>
        {coracoes.map((h) => (
          <motion.div
            key={h.id}
            initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
            animate={{ scale: [0.2, 1.3, 1], opacity: [0, 1, 1], rotate: [-15, 8, 0], y: [0, -10, -80] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85 }}
            className="pointer-events-none absolute z-30"
            style={{ left: h.x - 44, top: h.y - 44 }}
          >
            <Heart className="h-[88px] w-[88px] drop-shadow-[0_6px_20px_rgba(0,0,0,0.4)]" fill="var(--c-primary)" stroke="none" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* trilho de ações à direita */}
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+96px)] right-3 z-20 flex flex-col items-center gap-5 text-white" onPointerUp={(e) => e.stopPropagation()}>
        <RailBtn onClick={() => curtir(item.id)} label={compacto(curtidasDe(item.id))}>
          <motion.span key={String(curtido)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
            <Heart className="h-8 w-8 drop-shadow" fill={curtido ? "var(--c-primary)" : "rgba(0,0,0,0.15)"} stroke={curtido ? "var(--c-primary)" : "white"} />
          </motion.span>
        </RailBtn>
        <RailBtn onClick={() => abrirInfo(item.id)} label="Detalhes">
          <Info className="h-7 w-7 drop-shadow" />
        </RailBtn>
        <RailBtn onClick={compartilhar} label="Enviar">
          <Share2 className="h-7 w-7 drop-shadow" />
        </RailBtn>
      </div>

      {/* legenda */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-[calc(env(safe-area-inset-bottom)+28px)] pr-20 text-white">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {item.destaqueDoMes && <SeloMes />}
          <SeloRank rank={rank} />
          {item.tags?.map((t) => (
            <span key={t} className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold backdrop-blur">
              {tagInfo(t).emoji} {tagInfo(t).label}
            </span>
          ))}
        </div>
        <h2 className="text-[32px] leading-[1.02] drop-shadow-lg" style={{ fontFamily: "var(--f-display)" }}>
          {item.nome}
        </h2>
        <button onClick={() => setAberto((a) => !a)} className={`mt-1.5 text-left text-sm text-white/85 ${aberto ? "" : "line-clamp-2"}`}>
          {item.descricao}
        </button>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70 [&>span]:whitespace-nowrap">
          {item.tempoPreparo && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {item.tempoPreparo}
            </span>
          )}
          {item.serve && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {item.serve}
            </span>
          )}
          <span>{compacto(item.pedidos30d)} pedidos no mês</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="px-3 py-1.5 text-lg font-extrabold" style={{ background: "var(--c-primary)", color: "var(--c-on-primary)", borderRadius: "var(--radius)" }}>
            {brl(item.preco)}
          </span>
          {item.precoAntigo && <span className="text-sm text-white/60 line-through">{brl(item.precoAntigo)}</span>}
        </div>
        {combina && (
          <button
            onPointerUp={(e) => e.stopPropagation()}
            onClick={() => abrirNoFeed(combina.id)}
            className="mt-3 flex max-w-full items-center gap-2 bg-white/12 p-1.5 pr-3 text-left text-xs backdrop-blur-md"
            style={{ borderRadius: "var(--radius)" }}
          >
            <span className="relative h-9 w-9 shrink-0 overflow-hidden" style={{ borderRadius: "calc(var(--radius) * 0.7)" }}>
              <Capa item={combina} sizes="36px" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider text-white/60">Combina com</span>
              <span className="block truncate font-semibold">
                {combina.nome} · +{brl(combina.preco)}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-white/15">
        <div ref={barra} className="h-full origin-left" style={{ background: "var(--c-primary)", transform: "scaleX(0)" }} />
      </div>
    </section>
  )
}

function RailBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 transition active:scale-90">
      {children}
      <span className="text-[11px] font-semibold drop-shadow">{label}</span>
    </button>
  )
}
