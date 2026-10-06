import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart3, BellRing, Check, Crown, Flame, Globe, Heart, MessageCircle, Nfc, Palette, QrCode, Receipt, Smartphone, Sparkles, Wand2 } from "lucide-react"
import { RESTAURANTES } from "@/lib/cardapio/data"
import { FONTES, posterSrc } from "@/lib/cardapio/utils"
import { WHATSAPP_NUMBER } from "@/lib/constants"
import { MenuApp } from "@/components/cardapio/MenuApp"
import { QR } from "@/components/cardapio/QR"

const whats = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Oi! Quero o cardápio em vídeo no meu restaurante.")}`

const PASSOS = [
  { icone: Nfc, t: "Aproxima ou escaneia", d: "Etiqueta NFC e QR Code em cada mesa. Abre direto no navegador, sem baixar app." },
  { icone: Smartphone, t: "Rola como no TikTok", d: "Cada prato e bebida em vídeo vertical, com preço, selos e sugestão do que combina." },
  { icone: Receipt, t: "Monta a comanda", d: "O cliente toca no + e chama o garçom já sabendo o que quer. Menos espera, mais pedido." },
  { icone: BarChart3, t: "Você vê os dados", d: "Quais vídeos prendem, o que mais sai, o que destacar no mês. Decisão com número." },
]

const RECURSOS = [
  { icone: Flame, t: "Aba Mais pedidos", d: "Ranking automático dos últimos 30 dias, com crescimento de cada item. Prova social que vende." },
  { icone: Crown, t: "Itens do mês", d: "O restaurante escolhe os destaques no painel; eles ganham coroa e sobem para o topo do feed." },
  { icone: Palette, t: "Branding de cada casa", d: "Cores, fontes, arredondamento, logo e frase de abertura. Cada cliente com a própria cara." },
  { icone: Sparkles, t: "Combina com…", d: "Cada prato sugere a bebida ou acompanhamento ideal. Upsell sem garçom insistir." },
  { icone: Heart, t: "Curtir com dois toques", d: "O gesto que todo mundo já conhece. Vira métrica de desejo por prato." },
  { icone: BellRing, t: "Chamar garçom", d: "Botão na tela e comanda pronta para mostrar. Mesa identificada pelo NFC." },
  { icone: QrCode, t: "Placas prontas", d: "QR Code e link NFC gerados por mesa, no visual do restaurante, prontos para imprimir." },
  { icone: Globe, t: "Próximos passos", d: "Pedido direto na cozinha, integração com PDV e cardápio em inglês e espanhol para turistas." },
]

const PLANOS = [
  { nome: "Essencial", preco: "R$ 179", d: "Para começar com vídeo", itens: ["Cardápio em vídeo (até 30 itens)", "Mais pedidos e Itens do mês", "Branding da casa", "QR Code + NFC por mesa"] },
  {
    nome: "Pro",
    preco: "R$ 349",
    d: "O mais escolhido",
    destaque: true,
    itens: ["Tudo do Essencial", "Itens ilimitados", "Painel com métricas de vídeo", "Combina com (upsell)", "Chamar garçom pela mesa"],
  },
  { nome: "Premium", preco: "R$ 590", d: "Conteúdo novo todo mês", itens: ["Tudo do Pro", "Gravação de novos vídeos todo mês", "Relatório mensal com recomendações", "Vídeos liberados para o Instagram"] },
]

export default function VitrinePage() {
  const brasa = RESTAURANTES[0]
  return (
    <main className="min-h-[100dvh] overflow-x-clip bg-bg text-text-primary">
      {/* hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 60% at 75% 40%, rgba(160,32,240,0.28), transparent 70%), radial-gradient(40% 40% at 10% 10%, rgba(255,106,26,0.12), transparent 70%)" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div>
            <Link href="/" className="block text-sm font-semibold text-text-muted hover:text-white">
              ← Ideal Automações
            </Link>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-text-muted">
              <Nfc className="h-3.5 w-3.5" /> NFC + QR Code · sem baixar app
            </span>
            <h1 className="mt-4 text-[44px] font-extrabold leading-[1.02] tracking-tight md:text-6xl">
              O cardápio que o cliente <span className="bg-brand-gradient bg-clip-text text-transparent">rola como TikTok</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-text-muted">
              O cliente aproxima o celular da mesa e vê cada prato e bebida em vídeo, com preço, os mais pedidos da casa e os destaques do mês. Quem vê o prato em movimento pede mais.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/cardapio/${brasa.slug}?mesa=7`} className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 font-bold text-white shadow-lg shadow-accent/30">
                Abrir demonstração <ArrowRight className="h-5 w-5" />
              </Link>
              <a href={whats} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 font-semibold hover:bg-white/5">
                <MessageCircle className="h-5 w-5" /> Quero no meu restaurante
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                ["3", "restaurantes demo"],
                ["20", "vídeos de pratos"],
                ["0", "apps para baixar"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-3xl font-extrabold">{n}</dt>
                  <dd className="text-xs text-text-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto">
            <div className="absolute -left-24 top-24 z-10 hidden rotate-[-8deg] rounded-2xl border border-white/10 bg-surface/90 p-3 shadow-2xl backdrop-blur md:block">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Flame className="h-4 w-4 text-orange-400" /> #1 mais pedido
              </div>
              <div className="mt-1 text-sm text-text-muted">Bacon Duplo · 1.284 pedidos</div>
            </div>
            <div className="absolute -right-16 bottom-28 z-10 hidden rotate-[6deg] rounded-2xl border border-white/10 bg-surface/90 p-3 shadow-2xl backdrop-blur md:block">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Crown className="h-4 w-4 text-amber-300" /> Item do mês
              </div>
              <div className="mt-1 text-sm text-text-muted">escolhido no painel</div>
            </div>
            <div className="relative h-[680px] w-[330px] overflow-hidden rounded-[46px] border-[9px] border-[#1b1a1f] shadow-[0_40px_120px_-20px_rgba(160,32,240,0.45)]">
              <MenuApp restaurante={brasa} mesa="7" embutido />
            </div>
            <p className="mt-3 text-center text-xs text-text-muted">Interativo: deslize, toque duas vezes, adicione à comanda.</p>
          </div>
        </div>
      </section>

      {/* como funciona */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="text-3xl font-extrabold md:text-4xl">Como funciona na mesa</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {PASSOS.map((p, i) => (
            <div key={p.t} className="relative rounded-2xl border border-white/[0.07] bg-surface p-5">
              <span className="absolute right-4 top-3 text-5xl font-extrabold text-white/[0.05]">{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient">
                <p.icone className="h-5 w-5 text-white" />
              </span>
              <h3 className="mt-4 font-bold">{p.t}</h3>
              <p className="mt-1.5 text-sm text-text-muted">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* demos */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold md:text-4xl">Um sistema, a cara de cada restaurante</h2>
            <p className="mt-2 text-text-muted">Três restaurantes fictícios, mesmo produto. Abra no celular pelo QR Code.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {RESTAURANTES.map((r) => {
            const b = r.branding
            return (
              <article key={r.slug} className="overflow-hidden border border-white/10 shadow-2xl" style={{ background: b.bg, color: b.text, borderRadius: Math.max(b.radius, 12) }}>
                <div className="grid h-56 grid-cols-3 gap-1 p-1">
                  {r.itens.slice(0, 3).map((it) => (
                    <div key={it.id} className="relative overflow-hidden" style={{ borderRadius: Math.max(b.radius - 4, 4) }}>
                      <Image src={posterSrc(it.midia)} alt={it.nome} fill sizes="160px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center text-xl font-bold" style={{ background: b.primary, color: b.onPrimary, borderRadius: Math.min(b.radius, 14), fontFamily: FONTES[b.fontDisplay].css }}>
                      {b.logoMark}
                    </span>
                    <div>
                      <h3 className="text-2xl leading-none" style={{ fontFamily: FONTES[b.fontDisplay].css }}>
                        {r.nome}
                      </h3>
                      <p className="mt-1 text-xs" style={{ color: b.muted }}>
                        {r.tipo} · {r.cidade}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1.5">
                    {[b.primary, b.accent, b.surface, b.text].map((c, i) => (
                      <span key={i} className="h-6 flex-1 border border-black/10" style={{ background: c, borderRadius: 6 }} />
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="h-24 w-24 shrink-0 rounded-xl bg-white p-1.5">
                      <QR caminho={`/cardapio/${r.slug}?mesa=7`} className="h-full w-full" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <Link href={`/cardapio/${r.slug}?mesa=7`} className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-bold" style={{ background: b.primary, color: b.onPrimary, borderRadius: Math.max(b.radius - 4, 6) }}>
                        Abrir cardápio <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/cardapio/${r.slug}/painel`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold"
                        style={{ border: `1px solid color-mix(in srgb, ${b.text} 20%, transparent)`, borderRadius: Math.max(b.radius - 4, 6) }}
                      >
                        <Wand2 className="h-4 w-4" /> Painel
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* recursos */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="text-3xl font-extrabold md:text-4xl">O que vem no cardápio</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECURSOS.map((r) => (
            <div key={r.t} className="rounded-2xl border border-white/[0.07] bg-surface p-5">
              <r.icone className="h-6 w-6 text-accent" />
              <h3 className="mt-3 font-bold">{r.t}</h3>
              <p className="mt-1.5 text-sm text-text-muted">{r.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* planos */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="text-3xl font-extrabold md:text-4xl">Planos por restaurante</h2>
        <p className="mt-2 text-text-muted">
          Implantação a partir de <strong className="text-white">R$ 1.500</strong>: gravação e edição de 20 a 40 vídeos, cadastro do cardápio e placas NFC/QR para as mesas.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {PLANOS.map((p) => (
            <div key={p.nome} className={`relative rounded-3xl ${p.destaque ? "bg-brand-gradient p-[1.5px]" : "border border-white/[0.08] bg-surface p-6"}`}>
              <div className={p.destaque ? "h-full rounded-[22px] bg-surface p-6" : ""}>
                {p.destaque && <span className="absolute -top-3 left-6 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-white">{p.d}</span>}
                <h3 className="text-lg font-bold">{p.nome}</h3>
                {!p.destaque && <p className="text-sm text-text-muted">{p.d}</p>}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{p.preco}</span>
                  <span className="text-text-muted">/mês</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {p.itens.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 md:p-12">
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">Coloque o seu restaurante no feed</h2>
            <p className="mt-3 text-white/85">Gravamos os pratos, configuramos com a sua identidade e entregamos as placas das mesas. Em poucos dias seus clientes estão rolando o cardápio.</p>
            <a href={whats} target="_blank" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 font-bold text-black">
              <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
