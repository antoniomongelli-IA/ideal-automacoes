"use client"
import { motion } from "framer-motion"
import { Target, Eye, Zap, type LucideIcon } from "lucide-react"
import { VALUES } from "@/lib/constants"

const ICON_MAP: Record<string, LucideIcon> = { Target, Eye, Zap }

export function Sobre() {
  return (
    <section id="sobre" className="py-24 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-1 leading-tight">Antônio Mongelli</h2>
            <p className="text-accent font-medium mb-1 text-sm">Fundador & Especialista em IA e Automação</p>
            <p className="text-text-muted text-sm mb-6">📍 Campo Grande, MS</p>

            <p className="text-text-muted leading-relaxed mb-4">
              23 anos, 5 na área de tecnologia, os últimos focados exclusivamente em automação e IA para negócios. Já entreguei mais de 50 automações em 11 estados diferentes, de lavanderias em Belém a parques temáticos em Gramado.
            </p>

            <p className="text-text-muted leading-relaxed italic border-l-2 border-accent/40 pl-4 mb-8">
              "Comecei automatizando meu próprio negócio e vi o resultado na prática. Aí decidi fazer isso para todo mundo."
            </p>

            {/* Stats inline */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-sm border-t border-white/8 pt-6">
              {[
                { value: "+50", label: "automações entregues" },
                { value: "11", label: "estados atendidos" },
                { value: "5 anos", label: "em tecnologia" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-1.5">
                  <span className="text-accent font-bold text-lg leading-none">{stat.value}</span>
                  <span className="text-text-muted">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Valores */}
            <div className="flex flex-wrap gap-2">
              {VALUES.map((value) => {
                const Icon = ICON_MAP[value.icon]
                return (
                  <div key={value.label} className="flex items-center gap-2 bg-bg border border-white/8 rounded-xl px-4 py-2.5 hover:border-accent/25 transition-colors">
                    <Icon size={15} className="text-accent/70" />
                    <span className="text-text-muted text-sm font-medium">{value.label}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-3xl bg-brand-gradient p-1 shadow-[0_0_60px_rgba(160,32,240,0.3)]">
                <div className="w-full h-full rounded-3xl overflow-hidden">
                  <img src="/antonio.jpg" alt="Antônio Mongelli" className="w-full h-full object-cover object-[center_20%]" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
