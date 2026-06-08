"use client"
import { useEffect, useRef, useState } from "react"
import { MessageCircle, Bot, RefreshCw, Share2, TrendingUp, Plug, type LucideIcon } from "lucide-react"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { motion } from "framer-motion"
import { useTilt } from "@/hooks/useTilt"

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle, Bot, RefreshCw, Instagram: Share2, TrendingUp, Plug,
}

const SERVICES = [
  { id: "whatsapp", icon: "MessageCircle", title: "Atendimento via WhatsApp", description: "Assistente 24/7 que responde, qualifica e agenda sem intervenção humana.", metric: "< 1 min", metricLabel: "tempo de resposta", before: "2h para responder", after: "Resposta instantânea" },
  { id: "sdr", icon: "Bot", title: "SDR Automatizado com IA", description: "Primeira abordagem, qualificação e agendamento automáticos.", metric: "+40%", metricLabel: "taxa de conversão", before: "Leads frios sem follow-up", after: "Pipeline sempre ativo" },
  { id: "leads", icon: "RefreshCw", title: "Recuperação de Leads Perdidos", description: "Follow-up automático de orçamentos esquecidos e leads sem resposta.", metric: "3×", metricLabel: "mais reativações", before: "Lead sumiu, oportunidade perdida", after: "Reativação automática" },
  { id: "instagram", icon: "Instagram", title: "Automação para Instagram", description: "Responde comentários e directs, captura leads e direciona para vendas.", metric: "24/7", metricLabel: "engajamento ativo", before: "Comentários sem resposta", after: "Cada interação virou lead" },
  { id: "traffic", icon: "TrendingUp", title: "Tráfego Pago com IA", description: "Campanhas otimizadas com IA para geração de leads e escala comercial.", metric: "−35%", metricLabel: "custo por lead", before: "Verba desperdiçada em cliques", after: "IA otimiza em tempo real" },
  { id: "integrations", icon: "Plug", title: "Integrações Empresariais", description: "Conectamos WhatsApp, CRM, ERP e planilhas para sistemas que trabalham juntos.", metric: "−70%", metricLabel: "trabalho manual", before: "Dados espalhados em 5 sistemas", after: "Tudo conectado e automático" },
]

function ServiceCard({ service, index }: { service: typeof SERVICES[0]; index: number }) {
  const Icon = ICON_MAP[service.icon]
  const visRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [scanKey, setScanKey] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const tilt = useTilt(8)

  useEffect(() => {
    const el = visRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    tilt.onMouseMove(e as React.MouseEvent<HTMLElement>)
    const rect = e.currentTarget.getBoundingClientRect()
    setMouse({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    })
  }

  const handleMouseEnter = () => {
    setHovered(true)
    setScanKey(k => k + 1)
  }

  const handleMouseLeave = () => {
    tilt.onMouseLeave()
    setHovered(false)
    setMouse({ x: 0, y: 0 })
  }

  const iconStyle = {
    transform: `translate(${mouse.x * 14}px, ${mouse.y * 14}px)`,
    transition: hovered ? "transform 0.08s linear" : "transform 0.5s ease-out",
  }

  const wmStyle = {
    transform: `translate(${mouse.x * -10}px, ${mouse.y * -10}px) scale(${hovered ? 1.08 : 1})`,
    transition: hovered ? "transform 0.08s linear" : "transform 0.5s ease-out",
  }

  return (
    <motion.div
      ref={visRef}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group cursor-default"
      style={tilt.style}
    >
      {/* Beam border wrapper */}
      <div className="relative rounded-2xl p-[1px] overflow-hidden h-full">

        {/* Rotating beam */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: "-150%",
            background: "conic-gradient(from 0deg, transparent 0%, transparent 55%, rgba(160,32,240,0.6) 65%, rgba(204,68,255,1) 70%, rgba(160,32,240,0.6) 75%, transparent 82%)",
            animation: "border-beam 2.5s linear infinite",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Card content */}
        <div className="relative rounded-[15px] bg-[#0f0d1c] p-6 flex flex-col gap-4 h-full overflow-hidden">

          {/* Scan line */}
          <div
            key={scanKey}
            className="absolute left-0 right-0 h-[2px] pointer-events-none z-20"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(160,32,240,0.5), rgba(204,68,255,0.9), rgba(160,32,240,0.5), transparent)",
              animation: hovered ? "scan-down 0.55s ease-out forwards" : "none",
              top: 0,
            }}
          />

          {/* Watermark metric */}
          <span
            className="pointer-events-none absolute right-2 bottom-2 font-bold leading-none select-none"
            style={{ fontSize: "80px", color: "rgba(160,32,240,0.07)", letterSpacing: "-2px", ...wmStyle }}
          >
            {service.metric}
          </span>

          {/* Icon + metric */}
          <div className="flex items-start justify-between">
            <div style={iconStyle}>
              <Icon size={22} className="text-accent/60 group-hover:text-accent transition-colors duration-300" />
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-[#CC44FF] leading-none tabular-nums">{service.metric}</div>
              <div className="text-[10px] text-white/30 font-medium uppercase tracking-wider mt-1">{service.metricLabel}</div>
            </div>
          </div>

          <div className="relative">
            <h3 className="text-text-primary font-semibold text-base mb-1.5 leading-snug">{service.title}</h3>
            <p className="text-text-muted text-sm leading-relaxed">{service.description}</p>
          </div>

          <div className="relative flex items-center gap-2 text-xs mt-auto pt-3 border-t border-white/5">
            <span className="text-white/25 line-through">{service.before}</span>
            <span className="text-white/15">→</span>
            <span className="text-accent/70 font-medium">{service.after}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Servicos() {
  return (
    <section id="servicos" className="py-24 px-6 bg-bg">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="O que a Ideal Automações faz por você"
          subtitle="Soluções sob medida para cada gargalo do seu negócio"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
