"use client"
import { useMemo, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChefHat, Crown, Flame, Play, Search, TrendingDown, TrendingUp } from "lucide-react"
import { brl, compacto, crescimento, maisPedidos, mesAtual, posterSrc } from "@/lib/cardapio/utils"
import { AutoVideo, SeloMes, SeloRank, useMenu } from "./ui"

const card = { borderRadius: "var(--radius)", background: "var(--c-surface)" }

function Chips({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  const { r } = useMenu()
  const opcoes = [{ id: "todos", nome: "Todos", emoji: "✨" }, ...r.categorias]
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {opcoes.map((c) => {
        const on = c.id === valor
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className="shrink-0 px-3.5 py-2 text-sm font-semibold transition"
            style={{
              borderRadius: "999px",
              background: on ? "var(--c-primary)" : "var(--c-surface)",
              color: on ? "var(--c-on-primary)" : "var(--c-text)",
              border: on ? "1px solid transparent" : "1px solid color-mix(in srgb, var(--c-text) 10%, transparent)",
            }}
          >
            {c.emoji} {c.nome}
          </button>
        )
      })}
    </div>
  )
}

function Crescimento({ pct }: { pct: number }) {
  const sobe = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${sobe ? "text-emerald-500" : "text-rose-400"}`}>
      {sobe ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {sobe ? "+" : ""}
      {pct}%
    </span>
  )
}

const Titulo = ({ icone, titulo, sub }: { icone: React.ReactNode; titulo: string; sub: string }) => (
  <div className="mb-4">
    <h2 className="flex items-center gap-2 text-[34px] leading-none" style={{ fontFamily: "var(--f-display)" }}>
      {icone}
      {titulo}
    </h2>
    <p className="mt-1.5 text-sm" style={{ color: "var(--c-muted)" }}>
      {sub}
    </p>
  </div>
)

// ------------------------------------------------------------ Mais pedidos

export function MaisPedidos() {
  const { r, abrirNoFeed } = useMenu()
  const [cat, setCat] = useState("todos")
  const lista = useMemo(() => maisPedidos(r.itens.filter((i) => cat === "todos" || i.categoria === cat)), [r.itens, cat])
  const topo = lista[0]?.pedidos30d ?? 1
  const ids = lista.map((i) => i.id)
  const [p1, p2, p3, ...resto] = lista

  return (
    <div className="px-4 pb-32">
      <Titulo icone={<Flame className="h-8 w-8" style={{ color: "var(--c-primary)" }} fill="currentColor" />} titulo="Mais pedidos" sub="Os mais vendidos da casa nos últimos 30 dias" />
      <Chips valor={cat} onChange={setCat} />

      {p1 && (
        <motion.button
          layout
          key={p1.id}
          onClick={() => abrirNoFeed(p1.id, ids)}
          className="relative mt-4 block aspect-[4/5] w-full overflow-hidden text-left text-white"
          style={{ borderRadius: "var(--radius)" }}
        >
          <AutoVideo midia={p1.midia} className="absolute inset-0" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
          <span
            className="absolute left-3 top-3 grid h-14 w-14 place-items-center text-3xl shadow-xl"
            style={{ background: "var(--c-accent)", color: "#1a1208", borderRadius: "999px", fontFamily: "var(--f-display)" }}
          >
            1
          </span>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            <Play className="h-3 w-3" fill="white" /> ver vídeo
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--c-accent)" }}>
              O mais pedido da casa
            </div>
            <div className="text-[30px] leading-none" style={{ fontFamily: "var(--f-display)" }}>
              {p1.nome}
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="font-extrabold">{brl(p1.preco)}</span>
              <span className="text-white/75">{p1.pedidos30d.toLocaleString("pt-BR")} pedidos</span>
              <Crescimento pct={crescimento(p1)} />
            </div>
          </div>
        </motion.button>
      )}

      {(p2 || p3) && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[p2, p3].filter(Boolean).map((it, i) => (
            <button key={it.id} onClick={() => abrirNoFeed(it.id, ids)} className="relative aspect-[3/4] overflow-hidden text-left text-white" style={{ borderRadius: "var(--radius)" }}>
              <AutoVideo midia={it.midia} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <span
                className="absolute left-2.5 top-2.5 grid h-10 w-10 place-items-center text-xl"
                style={{ background: "var(--c-surface)", color: "var(--c-text)", borderRadius: "999px", fontFamily: "var(--f-display)" }}
              >
                {i + 2}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="text-lg leading-tight" style={{ fontFamily: "var(--f-display)" }}>
                  {it.nome}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-bold">{brl(it.preco)}</span>
                  <Crescimento pct={crescimento(it)} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {resto.map((it, i) => (
          <div key={it.id} role="button" tabIndex={0} onClick={() => abrirNoFeed(it.id, ids)} className="flex w-full cursor-pointer items-center gap-3 p-2.5 text-left" style={card}>
            <span className="w-7 text-center text-2xl" style={{ fontFamily: "var(--f-display)", color: "var(--c-muted)" }}>
              {i + 4}
            </span>
            <span className="relative h-14 w-14 shrink-0 overflow-hidden" style={{ borderRadius: "calc(var(--radius) * 0.75)" }}>
              <Image src={posterSrc(it.midia)} alt="" fill sizes="56px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{it.nome}</span>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--c-text) 10%, transparent)" }}>
                <motion.span
                  className="block h-full rounded-full"
                  style={{ background: "var(--c-primary)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(it.pedidos30d / topo) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                />
              </span>
              <span className="mt-1 flex items-center gap-2 text-xs" style={{ color: "var(--c-muted)" }}>
                {it.pedidos30d.toLocaleString("pt-BR")} pedidos <Crescimento pct={crescimento(it)} />
              </span>
            </span>
            <span className="text-sm font-bold">{brl(it.preco)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------ Itens do mês

export function DoMes() {
  const { r, abrirNoFeed, ranks } = useMenu()
  const destaques = r.itens.filter((i) => i.destaqueDoMes)
  const idsMes = destaques.map((i) => i.id)
  const mes = mesAtual()

  return (
    <div className="px-4 pb-32">
      <Titulo icone={<Crown className="h-8 w-8" style={{ color: "var(--c-primary)" }} fill="currentColor" />} titulo={`Itens de ${mes}`} sub="Escolhidos pelo chef: novidades, sazonais e os queridinhos do mês" />
      {destaques.length === 0 && (
        <p className="p-6 text-center text-sm" style={{ ...card, color: "var(--c-muted)" }}>
          Nenhum item do mês selecionado. Marque no painel do restaurante.
        </p>
      )}
      <div className="space-y-5">
        {destaques.map((it, i) => (
          <motion.article
            key={it.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="overflow-hidden"
            style={card}
          >
            <button onClick={() => abrirNoFeed(it.id, idsMes)} className="relative block aspect-[4/3] w-full text-left">
              <AutoVideo midia={it.midia} className="absolute inset-0" priority={i === 0} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <SeloMes size="lg" />
                <SeloRank rank={ranks.get(it.id) ?? 99} size="lg" />
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-[28px] leading-none text-white" style={{ fontFamily: "var(--f-display)" }}>
                {it.nome}
              </div>
            </button>
            <div className="p-4">
              {it.notaDoChef && (
                <figure className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center" style={{ background: "var(--c-primary)", color: "var(--c-on-primary)", borderRadius: "999px" }}>
                    <ChefHat className="h-5 w-5" />
                  </span>
                  <blockquote className="text-[15px] italic leading-snug">“{it.notaDoChef}”</blockquote>
                </figure>
              )}
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-extrabold">{brl(it.preco)}</div>
                  <div className="text-xs" style={{ color: "var(--c-muted)" }}>
                    {compacto(it.curtidas)} curtidas · {compacto(it.pedidos30d)} pedidos
                  </div>
                </div>
                <button
                  onClick={() => abrirNoFeed(it.id, idsMes)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold"
                  style={{ borderRadius: "var(--radius)", border: "1px solid color-mix(in srgb, var(--c-text) 18%, transparent)" }}
                >
                  <Play className="h-4 w-4" /> Ver vídeo
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------ Cardápio completo (grade)

export function Grade() {
  const { r, abrirNoFeed, ranks } = useMenu()
  const [busca, setBusca] = useState("")
  const [cat, setCat] = useState("todos")
  const termo = busca.trim().toLowerCase()
  const filtrados = r.itens.filter(
    (i) => (cat === "todos" || i.categoria === cat) && (!termo || `${i.nome} ${i.descricao}`.toLowerCase().includes(termo)),
  )
  // ordem em que os pratos aparecem na tela: é a que o vídeo segue ao rolar
  const idsGrade = r.categorias
    .filter((c) => cat === "todos" || c.id === cat)
    .flatMap((c) => filtrados.filter((i) => i.categoria === c.id))
    .map((i) => i.id)

  return (
    <div className="px-4 pb-32">
      <label className="mb-3 flex items-center gap-2 px-3 py-2.5" style={card}>
        <Search className="h-4 w-4" style={{ color: "var(--c-muted)" }} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar prato, bebida, ingrediente…"
          className="w-full bg-transparent text-sm outline-none placeholder:opacity-60"
        />
      </label>
      <Chips valor={cat} onChange={setCat} />
      {r.categorias
        .filter((c) => cat === "todos" || c.id === cat)
        .map((c) => {
          const itens = filtrados.filter((i) => i.categoria === c.id)
          if (!itens.length) return null
          return (
            <section key={c.id} className="mt-5">
              <h3 className="mb-2.5 text-2xl" style={{ fontFamily: "var(--f-display)" }}>
                {c.emoji} {c.nome}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {itens.map((it) => {
                  const rank = ranks.get(it.id) ?? 99
                  return (
                    <div key={it.id} role="button" tabIndex={0} onClick={() => abrirNoFeed(it.id, idsGrade)} className="cursor-pointer overflow-hidden text-left" style={card}>
                      <span className="relative block aspect-[4/5]">
                        <Image src={posterSrc(it.midia)} alt="" fill sizes="220px" className="object-cover" />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute left-2 top-2 flex flex-col items-start gap-1">
                          {it.destaqueDoMes && <SeloMes />}
                          <SeloRank rank={rank} />
                        </span>
                        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                          <Play className="h-2.5 w-2.5" fill="white" /> vídeo
                        </span>
                      </span>
                      <span className="block p-2.5">
                        <span className="line-clamp-2 block text-sm font-semibold leading-tight">{it.nome}</span>
                        <span className="mt-2 block font-extrabold">{brl(it.preco)}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      {filtrados.length === 0 && (
        <p className="mt-10 text-center text-sm" style={{ color: "var(--c-muted)" }}>
          Nada encontrado para “{busca}”.
        </p>
      )}
    </div>
  )
}
