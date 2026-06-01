"use client"
import { MessageCircle, Bot, RefreshCw, Instagram, TrendingUp, Plug } from "lucide-react"
import { GlowCard } from "@/components/ui/GlowCard"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { SERVICES } from "@/lib/constants"

const ICON_MAP: Record<string, React.ElementType> = {
  MessageCircle,
  Bot,
  RefreshCw,
  Instagram,
  TrendingUp,
  Plug,
}

export function Servicos() {
  return (
    <section id="servicos" className="py-24 px-6 bg-bg">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="O que a Ideal Automações faz por você"
          subtitle="Soluções sob medida para cada gargalo do seu negócio"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon]
            return (
              <GlowCard key={service.id} delay={i * 0.08}>
                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(160,32,240,0.4)]">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-text-primary font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{service.description}</p>
              </GlowCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
