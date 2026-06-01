"use client"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { TECHNOLOGIES } from "@/lib/constants"

function MarqueeRow({ items, reverse = false }: { items: typeof TECHNOLOGIES; reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden">
      <div className={`flex gap-8 ${reverse ? "animate-marquee-right" : "animate-marquee-left"} w-max`}>
        {doubled.map((tech, i) => (
          <div
            key={`${tech.name}-${i}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-white/5 text-text-muted text-sm font-medium hover:text-accent hover:border-accent/30 transition-all duration-300 whitespace-nowrap cursor-default"
          >
            {tech.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Tecnologias() {
  const half = Math.ceil(TECHNOLOGIES.length / 2)
  return (
    <section id="tecnologias" className="py-24 bg-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="Ferramentas que dominamos" />
      </div>
      <div className="flex flex-col gap-4">
        <MarqueeRow items={TECHNOLOGIES.slice(0, half)} />
        <MarqueeRow items={TECHNOLOGIES.slice(half)} reverse />
      </div>
    </section>
  )
}
