"use client"
import { useState } from "react"

// Cor de série única validada (dataviz: slot 1 escuro, contraste >= 3:1 na superfície do painel)
const SERIE = "#3987e5"
const GRADE = "rgba(255,255,255,0.08)"
const EIXO = "rgba(255,255,255,0.45)"

export interface Ponto {
  rotulo: string
  valor: number
}

/** Linha + área de pedidos por dia, com crosshair e tooltip. */
export function GraficoLinha({ dados, marco, unidade = "pedidos" }: { dados: Ponto[]; marco?: { indice: number; texto: string }; unidade?: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 640
  const H = 240
  const pad = { t: 16, r: 12, b: 28, l: 40 }
  const max = Math.ceil(Math.max(...dados.map((d) => d.valor)) / 50) * 50
  const x = (i: number) => pad.l + (i / (dados.length - 1)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b)
  const linha = dados.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.valor)}`).join(" ")
  const area = `${linha} L${x(dados.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const ticks = [0, max / 2, max]

  const mover = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (dados.length - 1))
    setHover(Math.max(0, Math.min(dados.length - 1, i)))
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Pedidos por dia nos últimos ${dados.length} dias`}>
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={SERIE} stopOpacity="0.28" />
            <stop offset="1" stopColor={SERIE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={GRADE} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={EIXO}>
              {t}
            </text>
          </g>
        ))}
        {dados.map((d, i) =>
          i % 5 === 0 || i === dados.length - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={EIXO}>
              {d.rotulo}
            </text>
          ) : null,
        )}
        {marco && (
          <g>
            <line x1={x(marco.indice)} x2={x(marco.indice)} y1={pad.t} y2={y(0)} stroke="rgba(255,255,255,0.35)" />
            <text x={x(marco.indice) + 6} y={pad.t + 10} fontSize="11" fill="rgba(255,255,255,0.75)">
              {marco.texto}
            </text>
          </g>
        )}
        <path d={area} fill="url(#area)" />
        <path d={linha} fill="none" stroke={SERIE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={y(0)} stroke="rgba(255,255,255,0.4)" />
            <circle cx={x(hover)} cy={y(dados[hover].valor)} r="5" fill={SERIE} stroke="#15141a" strokeWidth="2" />
          </g>
        )}
        <rect x={pad.l} y={0} width={W - pad.l - pad.r} height={H} fill="transparent" onPointerMove={mover} onPointerLeave={() => setHover(null)} />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-white/10 bg-[#1f1e25] px-3 py-2 text-xs shadow-xl"
          style={{ left: `clamp(0px, calc(${(x(hover) / W) * 100}% - 60px), calc(100% - 130px))` }}
        >
          <div className="text-base font-bold text-white">{dados[hover].valor}</div>
          <div className="flex items-center gap-1.5 text-white/60">
            <span className="inline-block h-0.5 w-3 rounded" style={{ background: SERIE }} />
            {unidade} · {dados[hover].rotulo}
          </div>
        </div>
      )}
    </div>
  )
}

/** Barras horizontais (ranking). Uma série, uma cor. */
export function GraficoBarras({ dados }: { dados: Ponto[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...dados.map((d) => d.valor))
  return (
    <ul className="space-y-[2px]" aria-label="Pedidos por item nos últimos 30 dias">
      {dados.map((d, i) => (
        <li
          key={d.rotulo}
          tabIndex={0}
          onPointerEnter={() => setHover(i)}
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(null)}
          className="grid grid-cols-[120px_1fr_56px] items-center gap-3 rounded-md px-1 py-1.5 outline-none transition hover:bg-white/[0.04] focus-visible:bg-white/[0.06]"
        >
          <span className="truncate text-sm text-white/80">{d.rotulo}</span>
          <span className="relative h-3">
            <span
              className="absolute inset-y-0 left-0 rounded-r-[4px] transition-[filter]"
              style={{ width: `${(d.valor / max) * 100}%`, background: SERIE, filter: hover === i ? "brightness(1.2)" : undefined }}
            />
          </span>
          <span className={`text-right text-sm tabular-nums ${i === 0 || hover === i ? "font-bold text-white" : "text-white/50"}`}>{d.valor.toLocaleString("pt-BR")}</span>
        </li>
      ))}
    </ul>
  )
}
