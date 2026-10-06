"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronLeft, Clock, Flame, Heart, Star, Users } from "lucide-react"
import type { Item, Restaurante } from "@/lib/cardapio/types"
import { aplicarPromocoes, brandingVars, brl, ordemFeed, promoAte, promoNoAr, rankDe, rankingPorVendas, tagInfo } from "@/lib/cardapio/utils"
import { aplicarPersonalizacao, usePersonalizacao } from "@/lib/cardapio/personalizacao"
import { type Tela, useNavegacao } from "@/lib/cardapio/navegacao"
import { type Cliente, clienteAtual, curtidasSalvas, curtirNoBanco, favoritosNoBanco, registrarEvento, sairCliente, salvarCurtidas } from "@/lib/cardapio/publico"
import { ArrastarVoltar } from "./ArrastarVoltar"
import { FolhaConta, FolhaFavoritos } from "./Favoritos"
import { Feed } from "./Feed"
import { DoMes, Grade, MaisPedidos } from "./Abas"
import { type Aba, BotaoPedir, Capa, Folha, LogoMarca, MenuContext, type MenuCtx, SeloMes, SeloPromo, SeloRank, useMenu } from "./ui"

const ABAS: { id: Aba; label: string }[] = [
  { id: "feed", label: "Para você" },
  { id: "top", label: "Mais pedidos" },
  { id: "mes", label: "Do mês" },
  { id: "cardapio", label: "Cardápio" },
]

// O convite para criar conta aparece uma vez por celular para cada motivo
// (curtir, compartilhar e depois de 2 minutos no cardápio)
type MotivoConvite = "curtiu" | "compartilhou" | "tempo"
const jaOfereceuConta = (acao: MotivoConvite) => {
  try {
    return localStorage.getItem(`cardapio:ofereceu-conta:${acao}`) === "1"
  } catch {
    return true
  }
}
const marcarOfereceuConta = (acao: MotivoConvite) => {
  try {
    localStorage.setItem(`cardapio:ofereceu-conta:${acao}`, "1")
  } catch {
    /* ignora */
  }
}

// Tempo no cardápio (só conta com a tela ligada e o cardápio aberto)
const CONVITE_CONTA_SEG = 120 // 2 minutos: convite para criar conta
const PEDIR_AVALIACAO_SEG = 300 // 5 minutos: "Avalie no Google"
const sessao = {
  ler: (k: string) => {
    try {
      return sessionStorage.getItem(k)
    } catch {
      return null
    }
  },
  gravar: (k: string, v: string) => {
    try {
      sessionStorage.setItem(k, v)
    } catch {
      /* ignora */
    }
  },
}
// "Avalie no Google" aparece no máximo uma vez a cada 30 dias por celular
const chaveAvaliacao = (slug: string) => `cardapio:pediu-avaliacao:${slug}`
const podePedirAvaliacao = (slug: string) => {
  try {
    return Date.now() - Number(localStorage.getItem(chaveAvaliacao(slug)) || 0) > 30 * 24 * 3600 * 1000
  } catch {
    return false
  }
}
const marcarPediuAvaliacao = (slug: string) => {
  try {
    localStorage.setItem(chaveAvaliacao(slug), String(Date.now()))
  } catch {
    /* ignora */
  }
}

interface Props {
  restaurante: Restaurante
  itemInicial?: string
  /** dentro do painel (pré-visualização): sem tela de abertura e sem ler o localStorage */
  embutido?: boolean
}

export function MenuApp({ restaurante, itemInicial, embutido = false }: Props) {
  const [personalizacao] = usePersonalizacao(restaurante.slug)
  // relógio para as promoções com horário (só no navegador, para não divergir do servidor)
  const [agora, setAgora] = useState<Date | null>(null)
  useEffect(() => {
    if (!restaurante.promocoes?.length) return
    const tick = () => setAgora(new Date())
    const primeira = setTimeout(tick, 0)
    const t = setInterval(tick, 30_000)
    return () => {
      clearTimeout(primeira)
      clearInterval(t)
    }
  }, [restaurante.promocoes])
  // ids das promoções valendo agora (texto, para só recalcular o cardápio quando mudar)
  const promosAgora = agora ? (restaurante.promocoes ?? []).filter((p) => promoNoAr(p, agora)).map((p) => p.id).join(",") : ""
  // a personalização salva no navegador só vale para as demos (no banco, o painel grava direto)
  const r = useMemo(() => {
    const base = embutido || restaurante.fonte === "banco" ? restaurante : aplicarPersonalizacao(restaurante, personalizacao)
    const ids = promosAgora.split(",")
    return aplicarPromocoes(base, (base.promocoes ?? []).filter((p) => ids.includes(p.id)))
  }, [embutido, restaurante, personalizacao, promosAgora])
  // promoções no ar para o aviso do topo (as de item pausado não aparecem)
  const promosNoAr = useMemo(() => {
    const ids = promosAgora.split(",")
    return (r.promocoes ?? []).filter((p) => ids.includes(p.id) && (!p.itemId || r.itens.some((i) => i.id === p.itemId)))
  }, [r, promosAgora])
  const ranks = useMemo(() => rankDe(r.itens), [r.itens])
  const feed = useMemo(() => ordemFeed(r.itens), [r.itens])

  const { tela, podeVoltar, ir, atualizar, voltar } = useNavegacao({ aba: "feed", feedId: itemInicial, n: 0 }, embutido)
  const aba = tela.aba
  const [curtidos, setCurtidos] = useState<Set<string>>(new Set())
  // curtidas que já vinham contadas no total do servidor quando a página abriu
  const [curtidosNaCarga, setCurtidosNaCarga] = useState<Set<string>>(new Set())
  const [totais, setTotais] = useState<Map<string, number>>(new Map())
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [folha, setFolha] = useState<"favoritos" | "conta" | "google" | null>(null)
  // o que levou ao convite de conta (vai para a mensagem de boas-vindas)
  const [motivoConta, setMotivoConta] = useState<{ acao: "curtiu" | "compartilhou"; itemId: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [splash, setSplash] = useState(!embutido)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // o que está na tela agora, para os avisos por tempo não abrirem por cima de outra folha
  const estadoRef = useRef<{ livre: boolean; cliente: Cliente | null }>({ livre: false, cliente: null })
  const ofereceuNestaVisita = useRef(false)

  useEffect(() => {
    if (!splash) return
    const t = setTimeout(() => setSplash(false), 1700)
    return () => clearTimeout(t)
  }, [splash])

  // carrega favoritos (do aparelho e, com banco, da conta) e registra a abertura do cardápio
  useEffect(() => {
    if (embutido) return
    let vivo = true
    ;(async () => {
      const locais = curtidasSalvas(r.slug)
      const banco = r.id ? await favoritosNoBanco(r.id) : null
      const c = await clienteAtual()
      if (!vivo) return
      const lista = banco ?? locais
      setCurtidos(new Set(lista))
      // com banco, o total que veio do servidor já inclui as curtidas desta pessoa
      setCurtidosNaCarga(new Set(banco ?? []))
      setCliente(c)
    })()
    registrarEvento(r.id, "abriu")
    return () => {
      vivo = false
    }
  }, [embutido, r.id, r.slug, r.fonte])

  useEffect(() => {
    estadoRef.current = { livre: !splash && folha === null && !tela.info, cliente }
  })

  // avisos por tempo no cardápio: convite de conta aos 2 min e "Avalie no Google" aos 5 min
  useEffect(() => {
    if (embutido) return
    const chave = `cardapio:tempo:${r.slug}`
    let segundos = Number(sessao.ler(chave)) || 0
    const t = setInterval(() => {
      if (document.visibilityState !== "visible") return
      segundos += 5
      sessao.gravar(chave, String(segundos))
      const { livre, cliente: logado } = estadoRef.current
      if (!livre) return
      if (segundos >= CONVITE_CONTA_SEG && !logado && r.fonte === "banco" && !ofereceuNestaVisita.current && !jaOfereceuConta("tempo")) {
        marcarOfereceuConta("tempo")
        ofereceuNestaVisita.current = true
        setMotivoConta(null)
        setFolha("conta")
        return
      }
      if (segundos >= PEDIR_AVALIACAO_SEG && r.googleAvaliacao && podePedirAvaliacao(r.slug)) {
        marcarPediuAvaliacao(r.slug)
        setFolha("google")
      }
    }, 5000)
    return () => clearInterval(t)
  }, [embutido, r.slug, r.fonte, r.googleAvaliacao])

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
    curtir: (id, forcar) => {
      const vaiCurtir = forcar || !curtidos.has(id)
      if (vaiCurtir === curtidos.has(id)) return
      const next = new Set(curtidos)
      if (vaiCurtir) next.add(id)
      else next.delete(id)
      setCurtidos(next)
      salvarCurtidas(r.slug, [...next])
      if (r.fonte === "banco")
        curtirNoBanco(id, vaiCurtir).then((total) => {
          if (total === null) return
          setTotais((m) => new Map(m).set(id, total))
        })
      // primeira curtida sem conta: oferece salvar os favoritos (uma vez só)
      if (vaiCurtir) oferecerConta("curtiu", id)
    },
    compartilhou: (id) => oferecerConta("compartilhou", id),
    curtidasDe: (id) => {
      const it = item(id)
      if (totais.has(id)) return totais.get(id)!
      const base = it?.curtidas ?? 0
      return base + (curtidos.has(id) ? 1 : 0) - (curtidosNaCarga.has(id) ? 1 : 0)
    },
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
    abrirInfo: (id) => {
      registrarEvento(r.id, "detalhes", id)
      ir({ ...tela, info: id })
    },
  }

  // depois de curtir ou compartilhar, sem conta: convida para salvar os favoritos (uma vez por ação)
  function oferecerConta(acao: "curtiu" | "compartilhou", itemId: string) {
    if (cliente || embutido || r.fonte !== "banco" || jaOfereceuConta(acao)) return
    marcarOfereceuConta(acao)
    ofereceuNestaVisita.current = true
    setMotivoConta({ acao, itemId })
    setTimeout(() => setFolha("conta"), acao === "curtiu" ? 900 : 400)
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
  // depende só da lista (mesma referência enquanto o vídeo está aberto), não da posição atual
  const listaVideo = video?.lista
  const itensVideo = useMemo(() => (listaVideo ? listaVideo.map(item).filter((i): i is Item => !!i) : []), [listaVideo, item])
  const abas = rankingPorVendas(r.itens) ? ABAS : ABAS.map((a) => (a.id === "top" ? { ...a, label: "Em alta" } : a))
  const nomeAba = abas.find((a) => a.id === aba)?.label ?? "Cardápio"

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
              <div
                className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ paddingTop: `calc(env(safe-area-inset-top) + ${promosNoAr.length ? 146 : 108}px)` }}
              >
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
                  {!embutido && (
                    <button
                      onClick={() => setFolha("favoritos")}
                      aria-label="Meus favoritos"
                      className="relative ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full transition active:scale-90"
                      style={noFeed ? { background: "rgba(0,0,0,.35)" } : { background: `color-mix(in srgb, ${b.text} 8%, transparent)` }}
                    >
                      <Heart className="h-[18px] w-[18px]" fill={curtidos.size ? b.primary : "none"} stroke={curtidos.size ? b.primary : "currentColor"} />
                      {curtidos.size > 0 && (
                        <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold" style={{ background: b.primary, color: b.onPrimary }}>
                          {curtidos.size}
                        </span>
                      )}
                    </button>
                  )}
                </div>
                <nav className="relative mt-2 flex justify-between">
                  {abas.map((a) => {
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
                {/* promoções valendo agora */}
                {promosNoAr.length > 0 && (
                  <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {promosNoAr.map((p) => {
                      const it = p.itemId ? item(p.itemId) : undefined
                      return (
                        <button
                          key={p.id}
                          onClick={() => it && ctx.abrirNoFeed(it.id)}
                          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold shadow-lg"
                          style={{ background: "#e11d48", color: "#fff" }}
                        >
                          🔥 {p.titulo}
                          {it ? ` · ${it.nome} por ${brl(it.preco)}` : p.descricao ? ` · ${p.descricao}` : ""}
                          <span className="font-semibold opacity-80">· {promoAte(p)}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
              )}
            </header>

            {/* folha de detalhes */}
            <Folha aberta={!!tela.info} fechar={voltar}>
              {tela.info && <Detalhes id={tela.info} />}
            </Folha>

            {/* favoritos e conta do cliente */}
            <FolhaFavoritos
              aberta={folha === "favoritos"}
              fechar={() => setFolha(null)}
              cliente={cliente}
              abrirConta={() => {
                setMotivoConta(null)
                setFolha("conta")
              }}
              sair={async () => {
                await sairCliente()
                setCliente(null)
                avisar("Você saiu da sua conta")
              }}
            />
            {/* "Avalie no Google" (depois de 5 minutos no cardápio) */}
            <Folha aberta={folha === "google"} fechar={() => setFolha(null)}>
              <div className="pt-2 text-center">
                <div className="flex justify-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-8 w-8" fill="#FBBC04" stroke="#FBBC04" />
                  ))}
                </div>
                <h3 className="mt-3 text-2xl" style={{ fontFamily: "var(--f-display)" }}>
                  Está gostando do {r.nome}?
                </h3>
                <p className="mt-1 text-sm" style={{ color: "var(--c-muted)" }}>
                  Sua avaliação no Google ajuda muito a gente. Leva menos de 1 minuto!
                </p>
                <a
                  href={r.googleAvaliacao}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    registrarEvento(r.id, "avaliou")
                    setFolha(null)
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 py-3.5 font-bold"
                  style={{ background: "var(--c-primary)", color: "var(--c-on-primary)", borderRadius: "var(--radius)" }}
                >
                  ⭐ Avaliar no Google
                </a>
                <button onClick={() => setFolha(null)} className="mt-3 w-full text-center text-sm underline" style={{ color: "var(--c-muted)" }}>
                  Agora não
                </button>
              </div>
            </Folha>

            <FolhaConta
              motivo={motivoConta ? { ...motivoConta, itemNome: item(motivoConta.itemId)?.nome } : null}
              aberta={folha === "conta"}
              fechar={() => setFolha(null)}
              aoEntrar={async (c) => {
                setCliente(c)
                setFolha(null)
                avisar(`Pronto, ${c.nome.split(" ")[0]}! Seus favoritos estão salvos`)
                const ids = r.id ? await favoritosNoBanco(r.id) : null
                if (ids) {
                  setCurtidos(new Set(ids))
                  salvarCurtidas(r.slug, ids)
                }
              }}
            />
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

function Detalhes({ id }: { id: string }) {
  const { item, ranks, abrirNoFeed, r } = useMenu()
  const it = item(id)
  if (!it) return null
  const combina = it.combinaCom ? item(it.combinaCom) : undefined
  const cat = r.categorias.find((c) => c.id === it.categoria)
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5 pr-10">
        <SeloPromo promo={it.promo} />
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
              {tagInfo(t).emoji} {tagInfo(t).label}
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
            <Capa item={combina} sizes="48px" />
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
      <BotaoPedir item={it} />
    </div>
  )
}
