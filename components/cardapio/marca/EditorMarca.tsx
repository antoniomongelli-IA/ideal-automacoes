"use client"
import { useState } from "react"
import { ImageUp, Moon, Sun, Wand2 } from "lucide-react"
import type { Branding, FontKey } from "@/lib/cardapio/types"
import { FONTES } from "@/lib/cardapio/utils"
import { contraste, coresDaLogo, paletaCardapio, textoSobre } from "@/lib/cardapio/cores"
import { LIMITE_LOGO_MB } from "@/lib/cardapio/uploads"
import { LogoMarca } from "../ui"

const CORES: { k: keyof Branding; l: string }[] = [
  { k: "primary", l: "Principal" },
  { k: "accent", l: "Destaque" },
  { k: "bg", l: "Fundo" },
  { k: "surface", l: "Cartões" },
  { k: "text", l: "Texto" },
  { k: "muted", l: "Texto suave" },
]

export const temaDe = (b: Branding): "escuro" | "claro" => (contraste(b.bg, "#000000") < contraste(b.bg, "#FFFFFF") ? "escuro" : "claro")

/**
 * Editor da identidade visual. Ao enviar a logo, as cores são detectadas e o
 * cardápio inteiro ganha a paleta na hora. `aoEnviarLogo` recebe o arquivo
 * (o cadastro guarda para enviar depois; o painel envia na hora).
 */
export function EditorMarca({ branding, mudar, aoEnviarLogo }: { branding: Branding; mudar: (b: Branding) => void; aoEnviarLogo?: (arquivo: File, previa: string) => void }) {
  const [cores, setCores] = useState<string[]>([])
  const [erro, setErro] = useState("")
  const [lendo, setLendo] = useState(false)
  const [ajuste, setAjuste] = useState(false)
  const tema = temaDe(branding)

  const aplicar = (principal: string, destaque: string, t: "escuro" | "claro") => mudar({ ...branding, ...paletaCardapio(principal, destaque, t) })

  const escolherLogo = async (arquivo?: File) => {
    if (!arquivo) return
    setErro("")
    if (!arquivo.type.startsWith("image/")) return setErro("Envie uma imagem (PNG, JPG, SVG ou WEBP).")
    if (arquivo.size > LIMITE_LOGO_MB * 1024 * 1024) return setErro(`A logo pode ter até ${LIMITE_LOGO_MB} MB.`)
    setLendo(true)
    const previa = URL.createObjectURL(arquivo)
    try {
      const c = await coresDaLogo(previa)
      setCores(c.cores)
      const t = c.logoEscura ? "claro" : tema
      mudar({ ...branding, logo: previa, ...paletaCardapio(c.principal, c.destaque, t) })
      aoEnviarLogo?.(arquivo, previa)
    } catch {
      setErro("Não consegui ler essa imagem. Tente um PNG ou JPG.")
    } finally {
      setLendo(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* logo */}
      <div>
        <div className="mb-2 text-sm font-semibold text-white/70">Logo</div>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
          <span className="rounded-xl bg-white/5 p-1.5" style={{ fontFamily: FONTES[branding.fontDisplay].css }}>
            <LogoMarca b={branding} size={64} />
          </span>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black">
            <ImageUp className="h-4 w-4" /> {branding.logo ? "Trocar logo" : "Enviar logo"}
            <input id="marca-logo" type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="sr-only" onChange={(e) => escolherLogo(e.target.files?.[0])} />
          </label>
          <p className="min-w-[180px] flex-1 text-xs text-white/50">{lendo ? "Lendo as cores da logo…" : erro || "As cores do cardápio saem da sua logo. Prefira PNG com fundo transparente."}</p>
        </div>
      </div>

      {/* cores detectadas */}
      {cores.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-white/70">
            <Wand2 className="h-4 w-4" /> Cores da sua logo · toque para usar como principal
          </div>
          <div className="flex flex-wrap gap-2">
            {cores.map((c) => (
              <button
                key={c}
                onClick={() => aplicar(c, cores.find((x) => x !== c) ?? branding.accent, tema)}
                className={`h-11 w-11 rounded-xl border-2 transition ${branding.primary.toUpperCase() === c ? "border-white" : "border-transparent"}`}
                style={{ background: c }}
                aria-label={`Usar ${c}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* tema */}
      <div>
        <div className="mb-2 text-sm font-semibold text-white/70">Fundo do cardápio</div>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { t: "escuro", l: "Escuro", d: "Os vídeos se destacam", i: Moon },
              { t: "claro", l: "Claro", d: "Leve e clássico", i: Sun },
            ] as const
          ).map((o) => (
            <button
              key={o.t}
              onClick={() => aplicar(branding.primary, branding.accent, o.t)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${tema === o.t ? "border-white/60 bg-white/10" : "border-white/10 hover:bg-white/5"}`}
            >
              <o.i className="h-5 w-5" />
              <span>
                <span className="block text-sm font-semibold">{o.l}</span>
                <span className="text-xs text-white/50">{o.d}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* fonte */}
      <div>
        <div className="mb-2 text-sm font-semibold text-white/70">Letra dos títulos</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.keys(FONTES) as FontKey[]).map((f) => (
            <button
              key={f}
              onClick={() => mudar({ ...branding, fontDisplay: f })}
              className={`rounded-xl border p-2.5 text-left transition ${branding.fontDisplay === f ? "border-white/60 bg-white/10" : "border-white/10 hover:bg-white/5"}`}
            >
              <span className="block truncate text-lg leading-none" style={{ fontFamily: FONTES[f].css }}>
                {branding.logoText || "Seu cardápio"}
              </span>
              <span className="mt-1 block text-[11px] text-white/50">{FONTES[f].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* textos */}
      <div className="grid gap-3 sm:grid-cols-[1fr_88px]">
        <Campo id="marca-nome" l="Nome no topo do cardápio" v={branding.logoText} on={(v) => mudar({ ...branding, logoText: v })} />
        <Campo id="marca-selo" l="Selo (sem logo)" v={branding.logoMark} on={(v) => mudar({ ...branding, logoMark: v.slice(0, 3) })} />
      </div>
      <Campo id="marca-frase" l="Frase da tela de abertura" v={branding.tagline} on={(v) => mudar({ ...branding, tagline: v })} />

      {/* ajuste fino */}
      <div>
        <button onClick={() => setAjuste((a) => !a)} className="text-sm font-semibold text-white/60 underline">
          {ajuste ? "Esconder ajuste fino" : "Ajuste fino de cores e cantos"}
        </button>
        {ajuste && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CORES.map(({ k, l }) => (
                <label key={k} className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2 text-sm">
                  <input
                    id={`marca-cor-${k}`}
                    type="color"
                    value={branding[k] as string}
                    onChange={(e) => mudar({ ...branding, [k]: e.target.value, ...(k === "primary" ? { onPrimary: textoSobre(e.target.value) } : {}) })}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="min-w-0">
                    <span className="block truncate">{l}</span>
                    <span className="font-mono text-[11px] text-white/40">{String(branding[k]).toUpperCase()}</span>
                  </span>
                </label>
              ))}
            </div>
            <label className="block">
              <span className="mb-1 flex justify-between text-sm text-white/70">
                Cantos arredondados <span className="font-mono text-white/40">{branding.radius}px</span>
              </span>
              <input id="marca-raio" type="range" min={0} max={28} value={branding.radius} onChange={(e) => mudar({ ...branding, radius: +e.target.value })} className="w-full accent-white" />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

export function Campo({ id, l, v, on, tipo = "text", placeholder, dica }: { id: string; l: string; v: string; on: (v: string) => void; tipo?: string; placeholder?: string; dica?: string }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-xs font-semibold text-white/60">{l}</span>
      <input
        id={id}
        type={tipo}
        value={v}
        placeholder={placeholder}
        onChange={(e) => on(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[15px] outline-none placeholder:text-white/25 focus:border-white/40"
      />
      {dica && <span className="mt-1 block text-xs text-white/40">{dica}</span>}
    </label>
  )
}
