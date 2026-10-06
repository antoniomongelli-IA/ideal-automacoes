import Link from "next/link"
import { ArrowUpRight, LayoutGrid, Nfc, Palette } from "lucide-react"
import type { Restaurante } from "@/lib/cardapio/types"
import { QR } from "./QR"

/**
 * No celular o cardápio ocupa a tela inteira.
 * No computador ele aparece dentro de um "celular", com QR Code para abrir no aparelho.
 */
export function DesktopMoldura({ restaurante: r, children }: { restaurante: Restaurante; children: React.ReactNode }) {
  const b = r.branding
  return (
    <main className="relative min-h-[100dvh] overflow-hidden" style={{ background: "#07060a" }}>
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-60 md:block"
        style={{ background: `radial-gradient(60% 50% at 50% 40%, ${b.primary}55, transparent 70%), radial-gradient(40% 40% at 80% 90%, ${b.accent}33, transparent 70%)` }}
      />
      <div className="relative mx-auto flex min-h-[100dvh] items-center justify-center gap-14 md:px-8 md:py-8">
        <aside className="hidden w-64 text-white lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Demonstração</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight">{r.nome}</h1>
          <p className="mt-1 text-sm text-white/60">
            {r.tipo} · {r.cidade}
          </p>
          <div className="mt-6 rounded-2xl bg-white p-3 shadow-2xl">
            <QR caminho={`/cardapio/${r.slug}?mesa=7`} className="aspect-square w-full" />
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <Nfc className="h-4 w-4" /> Aponte a câmera (ou aproxime o NFC) para abrir no celular, como se estivesse na mesa 7.
          </p>
        </aside>

        <div className="relative h-[100dvh] w-full md:h-[min(860px,calc(100dvh-64px))] md:w-[400px] md:overflow-hidden md:rounded-[48px] md:border-[10px] md:border-[#1b1a1f] md:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
          <div className="pointer-events-none absolute left-1/2 top-2 z-[70] hidden h-6 w-28 -translate-x-1/2 rounded-full bg-black md:block" />
          {children}
        </div>

        <aside className="hidden w-64 space-y-3 text-white lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Experimente</p>
          {[
            { href: `/cardapio/${r.slug}/painel`, icone: <Palette className="h-5 w-5" />, t: "Painel do restaurante", d: "Mude cores, fontes e itens do mês ao vivo" },
            { href: "/cardapio", icone: <LayoutGrid className="h-5 w-5" />, t: "Outros restaurantes", d: "Mesmo sistema, branding diferente" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: b.primary, color: b.onPrimary }}>
                {l.icone}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-1 font-semibold">
                  {l.t} <ArrowUpRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="text-sm text-white/60">{l.d}</span>
              </span>
            </Link>
          ))}
          <ul className="space-y-2 pt-3 text-sm text-white/60">
            <li>👆 Deslize para cima para ver o próximo prato</li>
            <li>❤️ Toque duas vezes no vídeo para curtir</li>
            <li>➕ Monte a comanda e chame o garçom</li>
          </ul>
        </aside>
      </div>
    </main>
  )
}
