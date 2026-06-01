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
            <span className="text-accent text-sm font-semibold uppercase tracking-wide">Sobre o Fundador</span>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mt-2 mb-2">Antônio Mongelli</h2>
            <p className="text-accent font-medium mb-6">Fundador & Especialista em IA e Automação</p>

            <p className="text-text-muted leading-relaxed mb-8">
              A Ideal Automações nasceu da convicção de que toda empresa, independente do tamanho, merece operar com a eficiência que a tecnologia atual permite. Nossa missão é automatizar processos empresariais com IA para que negócios cresçam com mais eficiência, produtividade e previsibilidade.
            </p>

            <div className="flex gap-6">
              {VALUES.map((value) => {
                const Icon = ICON_MAP[value.icon]
                return (
                  <div key={value.label} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Icon size={18} className="text-accent" />
                    </div>
                    <span className="text-text-muted text-xs font-medium">{value.label}</span>
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
              <div className="w-72 h-72 rounded-3xl bg-brand-gradient p-1 shadow-[0_0_60px_rgba(160,32,240,0.3)]">
                <div className="w-full h-full rounded-3xl bg-surface flex items-center justify-center overflow-hidden">
                  <div className="text-text-muted text-center">
                    <div className="w-24 h-24 rounded-full bg-accent/20 mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-accent">AM</div>
                    <p className="text-sm">Adicionar foto</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
