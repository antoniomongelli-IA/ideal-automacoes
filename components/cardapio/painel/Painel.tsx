"use client"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { BarChart3, Check, Copy, Crown, ExternalLink, Eye, Nfc, Palette, Printer, RotateCcw, Smartphone, Sparkles, TrendingUp, Wand2 } from "lucide-react"
import type { Branding, FontKey, Restaurante } from "@/lib/cardapio/types"
import { RESTAURANTES } from "@/lib/cardapio/data"
import { brl, FONTES, maisPedidos, mesAtual, posterSrc } from "@/lib/cardapio/utils"
import { aplicarPersonalizacao, lerViews, usePersonalizacao } from "@/lib/cardapio/personalizacao"
import { MenuApp } from "../MenuApp"
import { QR } from "../QR"
import { GraficoBarras, GraficoLinha, type Ponto } from "./Graficos"

const PRESETS: { nome: string; b: Partial<Branding> }[] = [
  { nome: "Brasa", b: { primary: "#FF6A1A", onPrimary: "#160B06", accent: "#FFC93C", bg: "#0F0805", surface: "#1E120B", text: "#FFF4EA", muted: "#B9A08E", fontDisplay: "anton", radius: 14 } },
  { nome: "Zen", b: { primary: "#E8443A", onPrimary: "#FFFFFF", accent: "#F4E9D8", bg: "#0B0A0E", surface: "#16141B", text: "#F7F2EA", muted: "#9C97A6", fontDisplay: "shippori", radius: 4 } },
  { nome: "Trattoria", b: { primary: "#1F6B3A", onPrimary: "#FFF8EC", accent: "#C8302B", bg: "#FBF4E8", surface: "#FFFFFF", text: "#2A1E14", muted: "#7A6A58", fontDisplay: "fraunces", radius: 22 } },
  { nome: "Açaí", b: { primary: "#7B2CBF", onPrimary: "#FFFFFF", accent: "#C7F464", bg: "#1A0B2E", surface: "#2A1546", text: "#F5EEFF", muted: "#B9A6D6", fontDisplay: "bricolage", radius: 26 } },
  { nome: "Café", b: { primary: "#6F4E37", onPrimary: "#FFF7EE", accent: "#E9B872", bg: "#F4ECE1", surface: "#FFFDF9", text: "#2B1D14", muted: "#8A7362", fontDisplay: "playfair", radius: 16 } },
  { nome: "Praia", b: { primary: "#00A6A6", onPrimary: "#FFFFFF", accent: "#FFB703", bg: "#F1FBFB", surface: "#FFFFFF", text: "#073B4C", muted: "#5B7F8A", fontDisplay: "bricolage", radius: 20 } },
]

const CORES: { k: keyof Branding; l: string }[] = [
  { k: "primary", l: "Principal" },
  { k: "onPrimary", l: "Texto no botão" },
  { k: "accent", l: "Destaque" },
  { k: "bg", l: "Fundo" },
  { k: "surface", l: "Cartões" },
  { k: "text", l: "Texto" },
  { k: "muted", l: "Texto suave" },
]

const card = "rounded-2xl border border-white/[0.07] bg-[#15141a]"

/** Série diária de demonstração: estável antes do cardápio em vídeo, crescendo depois. */
function serieDiaria(r: Restaurante): Ponto[] {
  const total = r.itens.reduce((s, i) => s + i.pedidos30d, 0)
  const base = total / 30 / 1.1
  let seed = r.slug.length * 97
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const hoje = new Date()
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() - 29 + i)
    const fds = [5, 6].includes(d.getDay()) ? 1.35 : d.getDay() === 0 ? 1.15 : d.getDay() === 1 ? 0.7 : 1
    const efeito = i >= 12 ? 1 + Math.min(0.24, (i - 12) * 0.018) : 1
    return { rotulo: `${d.getDate()}/${d.getMonth() + 1}`, valor: Math.round(base * fds * efeito * (0.9 + rnd() * 0.2)) }
  })
}

export function Painel({ restaurante }: { restaurante: Restaurante }) {
  const [salvo, salvar] = usePersonalizacao(restaurante.slug)
  const publicado = useMemo(() => aplicarPersonalizacao(restaurante, salvo), [restaurante, salvo])
  const [branding, setBranding] = useState<Branding>(publicado.branding)
  const [destaques, setDestaques] = useState<string[]>(publicado.itens.filter((i) => i.destaqueDoMes).map((i) => i.id))
  const [views, setViews] = useState<Record<string, number>>({})
  const [ok, setOk] = useState(false)
  const [mesas, setMesas] = useState(6)

  // quando a versão publicada muda (ex.: carregou do localStorage), o editor acompanha
  const [base, setBase] = useState(publicado)
  if (base !== publicado) {
    setBase(publicado)
    setBranding(publicado.branding)
    setDestaques(publicado.itens.filter((i) => i.destaqueDoMes).map((i) => i.id))
  }

  useEffect(() => {
    const ler = () => setViews(lerViews(restaurante.slug))
    const primeira = setTimeout(ler, 0)
    const t = setInterval(ler, 3000)
    return () => {
      clearTimeout(primeira)
      clearInterval(t)
    }
  }, [restaurante.slug])

  const rascunho: Restaurante = useMemo(
    () => ({ ...restaurante, branding, itens: restaurante.itens.map((i) => ({ ...i, destaqueDoMes: destaques.includes(i.id) })) }),
    [restaurante, branding, destaques],
  )
  const alterado = JSON.stringify(branding) !== JSON.stringify(publicado.branding) || destaques.join() !== publicado.itens.filter((i) => i.destaqueDoMes).map((i) => i.id).join()

  const publicar = () => {
    salvar({ branding, destaques })
    setOk(true)
    setTimeout(() => setOk(false), 2200)
  }
  const restaurar = () => {
    salvar({})
    setBranding(restaurante.branding)
    setDestaques(restaurante.itens.filter((i) => i.destaqueDoMes).map((i) => i.id))
  }

  const set = <K extends keyof Branding>(k: K, v: Branding[K]) => setBranding((b) => ({ ...b, [k]: v }))

  // métricas (demonstração)
  const ranking = maisPedidos(restaurante.itens)
  const pedidos = ranking.reduce((s, i) => s + i.pedidos30d, 0)
  const faturamento = ranking.reduce((s, i) => s + i.pedidos30d * i.preco, 0)
  const viewsVideo = ranking.reduce((s, i) => s + Math.round(i.curtidas * 6.2 + i.pedidos30d * 3.1), 0)
  const serie = useMemo(() => serieDiaria(restaurante), [restaurante])
  const totalViewsDemo = Object.values(views).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-[100dvh] bg-[#0c0b10] text-white">
      <style>{`@media print { .no-print { display: none !important } .so-print { display: grid !important } body { background: white } }`}</style>

      <header className="no-print sticky top-0 z-30 border-b border-white/[0.06] bg-[#0c0b10]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 md:px-8">
          <Link href="/cardapio" className="text-sm font-semibold text-white/50 hover:text-white">
            ← Cardápio em Vídeo
          </Link>
          <span className="text-white/20">/</span>
          <span className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold" style={{ background: branding.primary, color: branding.onPrimary }}>
            {branding.logoMark}
          </span>
          <h1 className="font-bold">{restaurante.nome}</h1>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-white/60">Painel do restaurante</span>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={restaurante.slug}
              onChange={(e) => (window.location.href = `/cardapio/${e.target.value}/painel`)}
              className="rounded-lg border border-white/10 bg-[#15141a] px-3 py-2 text-sm"
              aria-label="Trocar restaurante"
            >
              {RESTAURANTES.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.nome}
                </option>
              ))}
            </select>
            <a href={`/cardapio/${restaurante.slug}?mesa=1`} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5">
              <ExternalLink className="h-4 w-4" /> Abrir cardápio
            </a>
          </div>
        </div>
      </header>

      <div className="no-print mx-auto grid max-w-[1400px] gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          {/* ---------------- resultados */}
          <section>
            <Titulo icone={<BarChart3 className="h-5 w-5" />} titulo="Resultados · últimos 30 dias" sub="Números de demonstração. Em produção, cada visualização e cada “+” no cardápio vira dado real." />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { l: "Visualizações de vídeo", v: viewsVideo.toLocaleString("pt-BR"), d: "+41% vs mês anterior" },
                { l: "Itens adicionados à comanda", v: pedidos.toLocaleString("pt-BR"), d: "+19% vs mês anterior" },
                { l: "Faturamento influenciado", v: brl(faturamento).replace(/,\d\d$/, ""), d: "itens vistos em vídeo" },
                { l: "Ticket médio por mesa", v: brl((faturamento / pedidos) * 2.6), d: "+14% após vídeos" },
              ].map((k, i) => (
                <motion.div key={k.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${card} p-4`}>
                  <div className="text-xs text-white/50">{k.l}</div>
                  <div className="mt-1.5 text-2xl font-extrabold tabular-nums">{k.v}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" /> {k.d}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
              <div className={`${card} p-4`}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="font-semibold">Itens pedidos por dia</h3>
                  <span className="text-xs text-white/40">passe o mouse no gráfico</span>
                </div>
                <GraficoLinha dados={serie} marco={{ indice: 12, texto: "Cardápio em vídeo no ar" }} unidade="itens" />
              </div>
              <div className={`${card} p-4`}>
                <h3 className="mb-3 font-semibold">Mais pedidos (vira a aba “Mais pedidos”)</h3>
                <GraficoBarras dados={ranking.map((i) => ({ rotulo: i.nome, valor: i.pedidos30d }))} />
              </div>
            </div>
            <div className={`${card} mt-3 p-4`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  Ao vivo nesta demonstração
                </h3>
                <span className="text-xs text-white/50">
                  {totalViewsDemo} visualizações registradas neste navegador. Abra o cardápio e deslize para ver subir.
                </span>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {ranking.map((i) => (
                  <div key={i.id} className="flex shrink-0 items-center gap-2 rounded-xl bg-white/[0.04] p-1.5 pr-3">
                    <span className="relative h-9 w-9 overflow-hidden rounded-lg">
                      <Image src={posterSrc(i.midia)} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                    <span className="text-xs">
                      <span className="block max-w-[120px] truncate text-white/70">{i.nome}</span>
                      <span className="flex items-center gap-1 font-bold">
                        <Eye className="h-3 w-3" /> {views[i.id] ?? 0}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ---------------- branding */}
          <section>
            <Titulo icone={<Palette className="h-5 w-5" />} titulo="Identidade visual" sub="Cada restaurante com a sua cara. A prévia ao lado muda na hora; “Publicar” atualiza o cardápio dos clientes." />
            <div className={`${card} p-4 md:p-5`}>
              <div className="mb-2 text-sm font-semibold text-white/70">
                <Wand2 className="mr-1 inline h-4 w-4" /> Começar de um tema
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button key={p.nome} onClick={() => setBranding((b) => ({ ...b, ...p.b }))} className="group flex items-center gap-2 rounded-xl border border-white/10 py-1.5 pl-1.5 pr-3 text-sm hover:bg-white/5">
                    <span className="flex overflow-hidden rounded-lg">
                      {[p.b.bg, p.b.primary, p.b.accent].map((c, i) => (
                        <span key={i} className="h-7 w-4" style={{ background: c }} />
                      ))}
                    </span>
                    {p.nome}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-semibold text-white/70">Cores</div>
                  <div className="grid grid-cols-2 gap-2">
                    {CORES.map(({ k, l }) => (
                      <label key={k} className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2 text-sm">
                        <input type="color" value={branding[k] as string} onChange={(e) => set(k, e.target.value as never)} className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
                        <span className="min-w-0">
                          <span className="block truncate">{l}</span>
                          <span className="font-mono text-[11px] text-white/40">{String(branding[k]).toUpperCase()}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-white/70">Fonte dos títulos</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(FONTES) as FontKey[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => set("fontDisplay", f)}
                          className={`rounded-xl border p-2.5 text-left transition ${branding.fontDisplay === f ? "border-white/60 bg-white/10" : "border-white/10 hover:bg-white/5"}`}
                        >
                          <span className="block text-xl leading-none" style={{ fontFamily: FONTES[f].css }}>
                            Bacon Duplo
                          </span>
                          <span className="mt-1 block text-[11px] text-white/50">{FONTES[f].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="block">
                    <span className="mb-2 flex justify-between text-sm font-semibold text-white/70">
                      Arredondamento <span className="font-mono text-white/40">{branding.radius}px</span>
                    </span>
                    <input type="range" min={0} max={28} value={branding.radius} onChange={(e) => set("radius", +e.target.value)} className="w-full accent-white" />
                  </label>
                  <div className="grid grid-cols-[72px_1fr] gap-2">
                    <Campo l="Selo" v={branding.logoMark} on={(v) => set("logoMark", v.slice(0, 3))} />
                    <Campo l="Nome no topo" v={branding.logoText} on={(v) => set("logoText", v)} />
                  </div>
                  <Campo l="Frase da tela de abertura" v={branding.tagline} on={(v) => set("tagline", v)} />
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- itens do mês */}
          <section>
            <Titulo icone={<Crown className="h-5 w-5" />} titulo={`Itens de ${mesAtual()}`} sub="Escolha o que aparece na aba “Do mês” e com a coroa no feed. Os escolhidos sobem para o topo do feed." />
            <div className="grid gap-2 sm:grid-cols-2">
              {restaurante.itens.map((i) => {
                const on = destaques.includes(i.id)
                return (
                  <button
                    key={i.id}
                    onClick={() => setDestaques((d) => (on ? d.filter((x) => x !== i.id) : [...d, i.id]))}
                    className={`flex items-center gap-3 rounded-2xl border p-2 text-left transition ${on ? "border-amber-300/60 bg-amber-300/[0.07]" : "border-white/[0.07] bg-[#15141a] hover:bg-white/5"}`}
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                      <Image src={posterSrc(i.midia)} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{i.nome}</span>
                      <span className="text-xs text-white/50">
                        {brl(i.preco)} · {i.pedidos30d.toLocaleString("pt-BR")} pedidos
                      </span>
                    </span>
                    <span className={`grid h-9 w-9 place-items-center rounded-full ${on ? "bg-amber-300 text-black" : "bg-white/[0.06] text-white/40"}`}>
                      <Crown className="h-4 w-4" fill={on ? "currentColor" : "none"} />
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ---------------- mesas & NFC */}
          <section>
            <Titulo icone={<Nfc className="h-5 w-5" />} titulo="Mesas · NFC e QR Code" sub="Cada mesa tem um link próprio. Grave o link numa etiqueta NFC (NTAG213) e imprima a placa com o QR Code." />
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-white/60">Mostrar</span>
              {[6, 12, restaurante.mesas].map((n) => (
                <button key={n} onClick={() => setMesas(n)} className={`rounded-full px-3 py-1 text-sm ${mesas === n ? "bg-white text-black" : "bg-white/[0.06]"}`}>
                  {n === restaurante.mesas ? `todas (${n})` : `${n} mesas`}
                </button>
              ))}
              <button onClick={() => window.print()} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black">
                <Printer className="h-4 w-4" /> Imprimir placas
              </button>
            </div>
            <Placas r={rascunho} n={mesas} />
          </section>
        </div>

        {/* ---------------- prévia ao vivo */}
        <aside className="xl:sticky xl:top-[76px] xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70">
              <Smartphone className="h-4 w-4" /> Prévia ao vivo
            </span>
            {alterado && <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-xs text-amber-200">alterações não publicadas</span>}
          </div>
          <div className="relative mx-auto h-[720px] w-[350px] overflow-hidden rounded-[44px] border-[9px] border-[#1f1e25] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            <MenuApp restaurante={rascunho} mesa="7" embutido />
          </div>
          <div className="mx-auto mt-4 flex w-[350px] gap-2">
            <button onClick={restaurar} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-3 text-sm hover:bg-white/5" title="Voltar ao padrão">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={publicar}
              disabled={!alterado && !ok}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold transition disabled:opacity-40"
              style={{ background: branding.primary, color: branding.onPrimary }}
            >
              {ok ? <Check className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              {ok ? "Publicado no cardápio!" : "Publicar no cardápio"}
            </button>
          </div>
          <p className="mx-auto mt-2 w-[350px] text-center text-xs text-white/40">Demo: a publicação fica salva neste navegador. Abra o cardápio em outra aba para ver.</p>
        </aside>
      </div>

      {/* versão impressa das placas */}
      <div className="so-print hidden grid-cols-2 gap-6 p-6">
        <PlacasImpressao r={rascunho} n={mesas} />
      </div>
    </div>
  )
}

function Titulo({ icone, titulo, sub }: { icone: React.ReactNode; titulo: string; sub: string }) {
  return (
    <div className="mb-3">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06]">{icone}</span>
        {titulo}
      </h2>
      <p className="mt-1 text-sm text-white/50">{sub}</p>
    </div>
  )
}

function Campo({ l, v, on }: { l: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/50">{l}</span>
      <input value={v} onChange={(e) => on(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-white/30" />
    </label>
  )
}

function Placa({ r, mesa }: { r: Restaurante; mesa: number }) {
  const b = r.branding
  const caminho = `/cardapio/${r.slug}?mesa=${mesa}`
  const [copiado, setCopiado] = useState(false)
  return (
    <div className="overflow-hidden text-center shadow-xl" style={{ background: b.bg, color: b.text, borderRadius: Math.max(b.radius, 8), fontFamily: FONTES[b.fontBody].css }}>
      <div className="px-4 pb-4 pt-5">
        <div className="mx-auto grid h-11 w-11 place-items-center text-xl font-bold" style={{ background: b.primary, color: b.onPrimary, borderRadius: Math.min(b.radius, 14), fontFamily: FONTES[b.fontDisplay].css }}>
          {b.logoMark}
        </div>
        <div className="mt-2 text-xl leading-none" style={{ fontFamily: FONTES[b.fontDisplay].css }}>
          {b.logoText}
        </div>
        <div className="mt-3 text-sm font-semibold">Veja nossos pratos em vídeo</div>
        <div className="mx-auto mt-3 w-32 rounded-xl bg-white p-2">
          <QR caminho={caminho} className="aspect-square w-full" />
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs" style={{ color: b.muted }}>
          <Nfc className="h-4 w-4" /> ou aproxime o celular aqui
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 text-sm font-bold" style={{ background: b.primary, color: b.onPrimary }}>
        <span>Mesa {String(mesa).padStart(2, "0")}</span>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(new URL(caminho, location.origin).toString()).catch(() => {})
            setCopiado(true)
            setTimeout(() => setCopiado(false), 1500)
          }}
          className="no-print inline-flex items-center gap-1 text-xs font-semibold opacity-80 hover:opacity-100"
          title="Copiar link para gravar na etiqueta NFC"
        >
          {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copiado ? "copiado" : "link NFC"}
        </button>
      </div>
    </div>
  )
}

function Placas({ r, n }: { r: Restaurante; n: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: n }, (_, i) => (
        <Placa key={i} r={r} mesa={i + 1} />
      ))}
    </div>
  )
}

function PlacasImpressao({ r, n }: { r: Restaurante; n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Placa key={i} r={r} mesa={i + 1} />
      ))}
    </>
  )
}
